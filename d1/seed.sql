INSERT OR IGNORE INTO subjects (id, code, name, description, is_archived, vector_store_id, created_at, updated_at)
VALUES
('subj_comp101', 'COMP101', 'Introduction to Computing', 'Foundations course materials.', 0, NULL, datetime('now'), datetime('now')),
('subj_math201', 'MATH201', 'Discrete Mathematics', 'Core maths subject documents.', 0, NULL, datetime('now'), datetime('now'));
