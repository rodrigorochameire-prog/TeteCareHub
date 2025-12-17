/*
  # Correção de Colunas Duplicadas no Calendar Events

  1. Objetivo
    - Garantir que as colunas linkedResourceType, linkedResourceId e autoCreated existam
    - Evitar erros de duplicação se já existirem
    - Criar índices se não existirem

  2. Abordagem
    - Usar procedimentos armazenados temporários para verificar existência
    - Adicionar colunas apenas se não existirem
    - Criar índices apenas se não existirem

  3. Segurança
    - Não gera erros se executada múltiplas vezes
    - Idempotente e segura
*/

-- Procedimento para adicionar coluna linkedResourceType se não existir
DROP PROCEDURE IF EXISTS add_linked_resource_type_column;

DELIMITER $$
CREATE PROCEDURE add_linked_resource_type_column()
BEGIN
  DECLARE column_exists INT DEFAULT 0;

  SELECT COUNT(*)
  INTO column_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'calendar_events'
    AND COLUMN_NAME = 'linkedResourceType';

  IF column_exists = 0 THEN
    ALTER TABLE calendar_events
    ADD COLUMN linkedResourceType ENUM('medication', 'vaccine', 'preventive_flea', 'preventive_deworming', 'health_log') AFTER logIds;
  END IF;
END$$
DELIMITER ;

CALL add_linked_resource_type_column();
DROP PROCEDURE add_linked_resource_type_column;

-- Procedimento para adicionar coluna linkedResourceId se não existir
DROP PROCEDURE IF EXISTS add_linked_resource_id_column;

DELIMITER $$
CREATE PROCEDURE add_linked_resource_id_column()
BEGIN
  DECLARE column_exists INT DEFAULT 0;

  SELECT COUNT(*)
  INTO column_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'calendar_events'
    AND COLUMN_NAME = 'linkedResourceId';

  IF column_exists = 0 THEN
    ALTER TABLE calendar_events
    ADD COLUMN linkedResourceId INT AFTER linkedResourceType;
  END IF;
END$$
DELIMITER ;

CALL add_linked_resource_id_column();
DROP PROCEDURE add_linked_resource_id_column;

-- Procedimento para adicionar coluna autoCreated se não existir
DROP PROCEDURE IF EXISTS add_auto_created_column;

DELIMITER $$
CREATE PROCEDURE add_auto_created_column()
BEGIN
  DECLARE column_exists INT DEFAULT 0;

  SELECT COUNT(*)
  INTO column_exists
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'calendar_events'
    AND COLUMN_NAME = 'autoCreated';

  IF column_exists = 0 THEN
    ALTER TABLE calendar_events
    ADD COLUMN autoCreated BOOLEAN NOT NULL DEFAULT FALSE AFTER linkedResourceId;
  END IF;
END$$
DELIMITER ;

CALL add_auto_created_column();
DROP PROCEDURE add_auto_created_column;

-- Procedimento para criar índice idx_linked_resource se não existir
DROP PROCEDURE IF EXISTS add_linked_resource_index;

DELIMITER $$
CREATE PROCEDURE add_linked_resource_index()
BEGIN
  DECLARE index_exists INT DEFAULT 0;

  SELECT COUNT(*)
  INTO index_exists
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'calendar_events'
    AND INDEX_NAME = 'idx_linked_resource';

  IF index_exists = 0 THEN
    CREATE INDEX idx_linked_resource ON calendar_events(linkedResourceType, linkedResourceId);
  END IF;
END$$
DELIMITER ;

CALL add_linked_resource_index();
DROP PROCEDURE add_linked_resource_index;

-- Procedimento para criar índice idx_auto_created se não existir
DROP PROCEDURE IF EXISTS add_auto_created_index;

DELIMITER $$
CREATE PROCEDURE add_auto_created_index()
BEGIN
  DECLARE index_exists INT DEFAULT 0;

  SELECT COUNT(*)
  INTO index_exists
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'calendar_events'
    AND INDEX_NAME = 'idx_auto_created';

  IF index_exists = 0 THEN
    CREATE INDEX idx_auto_created ON calendar_events(autoCreated);
  END IF;
END$$
DELIMITER ;

CALL add_auto_created_index();
DROP PROCEDURE add_auto_created_index;
