#!/usr/bin/env node
/**
 * Script para otimizar imagens na pasta public/
 * Reduz drasticamente o tamanho das imagens PNG mantendo qualidade visual
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = './public';
const MAX_WIDTH = 400; // Para ícones de raça, 400px é suficiente
const LOGO_MAX_WIDTH = 800; // Logo pode ser maior
const QUALITY = 80;

async function optimizeImage(inputPath) {
  const stats = fs.statSync(inputPath);
  const sizeBefore = stats.size;
  
  try {
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Determinar largura máxima baseado no tipo de imagem
    const isLogo = inputPath.includes('logo');
    const maxWidth = isLogo ? LOGO_MAX_WIDTH : MAX_WIDTH;
    
    // Só redimensionar se for maior que o máximo
    const shouldResize = metadata.width && metadata.width > maxWidth;
    
    // Criar buffer otimizado
    let pipeline = image;
    
    if (shouldResize) {
      pipeline = pipeline.resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside'
      });
    }
    
    // Comprimir como PNG
    const buffer = await pipeline
      .png({
        quality: QUALITY,
        compressionLevel: 9,
        palette: true, // Usar paleta quando possível
      })
      .toBuffer();
    
    // Só salvar se for menor
    if (buffer.length < sizeBefore) {
      fs.writeFileSync(inputPath, buffer);
      const sizeAfter = buffer.length;
      const reduction = ((sizeBefore - sizeAfter) / sizeBefore * 100).toFixed(1);
      console.log(`✓ ${path.basename(inputPath)}: ${(sizeBefore/1024).toFixed(0)}KB → ${(sizeAfter/1024).toFixed(0)}KB (-${reduction}%)`);
      return { before: sizeBefore, after: sizeAfter };
    } else {
      console.log(`○ ${path.basename(inputPath)}: já otimizado`);
      return { before: sizeBefore, after: sizeBefore };
    }
  } catch (error) {
    console.error(`✗ ${path.basename(inputPath)}: ${error.message}`);
    return { before: sizeBefore, after: sizeBefore };
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let totalBefore = 0;
  let totalAfter = 0;
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      const subResult = await processDirectory(fullPath);
      totalBefore += subResult.before;
      totalAfter += subResult.after;
    } else if (file.toLowerCase().endsWith('.png')) {
      const result = await optimizeImage(fullPath);
      totalBefore += result.before;
      totalAfter += result.after;
    }
  }
  
  return { before: totalBefore, after: totalAfter };
}

console.log('🖼️  Otimizando imagens em public/...\n');

const result = await processDirectory(PUBLIC_DIR);

console.log('\n📊 Resultado:');
console.log(`   Antes: ${(result.before / 1024 / 1024).toFixed(2)}MB`);
console.log(`   Depois: ${(result.after / 1024 / 1024).toFixed(2)}MB`);
console.log(`   Economia: ${((result.before - result.after) / 1024 / 1024).toFixed(2)}MB (${((result.before - result.after) / result.before * 100).toFixed(1)}%)`);
