-- Reports table: type of user_id must match users.id exactly (signed INT).
-- If your users.id is INT UNSIGNED, change user_id to INT UNSIGNED below.

USE drugssearch;

CREATE TABLE IF NOT EXISTS reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NULL,
    extracted_text LONGTEXT NULL,
    uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_user_id (user_id),
    CONSTRAINT fk_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
