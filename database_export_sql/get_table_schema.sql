-- ============================================
-- 获取所有表结构的 SQL 查询
-- 在 Supabase SQL Editor 中执行此查询
-- ============================================

-- 1. 获取所有表的基本信息
SELECT 
    t.table_schema,
    t.table_name,
    obj_description(c.oid, 'pg_class') as table_comment,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_schema = t.table_schema 
       AND table_name = t.table_name) as column_count
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public' 
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;

-- 2. 获取所有表的列信息（详细）
SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    c.udt_name as format_type,
    c.is_nullable,
    c.column_default,
    c.character_maximum_length,
    c.numeric_precision,
    c.numeric_scale,
    col_description(pgc.oid, c.ordinal_position) as column_comment
FROM information_schema.columns c
LEFT JOIN pg_class pgc ON pgc.relname = c.table_name
WHERE c.table_schema = 'public'
ORDER BY c.table_name, c.ordinal_position;

-- 3. 获取所有主键信息
SELECT
    tc.table_name,
    STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as primary_key_columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public'
GROUP BY tc.table_name
ORDER BY tc.table_name;

-- 4. 获取所有外键信息
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. 获取所有索引信息
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;





