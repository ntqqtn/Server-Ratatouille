-- Xóa database nếu đã tồn tại và tạo lại
DROP DATABASE IF EXISTS fall2024c8g10_educationsystem;
CREATE DATABASE fall2024c8g10_educationsystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fall2024c8g10_educationsystem;

-- Bảng users
CREATE TABLE users (
    user_id VARCHAR(8) PRIMARY KEY,
    -- username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name NVARCHAR(255),
    role ENUM('admin', 'teacher', 'student') NOT NULL,
    email NVARCHAR(255) UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    phone_number VARCHAR(10),
    gender ENUM('male','female'),
    birth_date DATE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng terms
CREATE TABLE terms (
    term_id VARCHAR(50) PRIMARY KEY,
    term_name NVARCHAR(255)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng courses
CREATE TABLE courses (
    course_id VARCHAR(50) PRIMARY KEY UNIQUE NOT NULL,
    course_name NVARCHAR(255) NOT NULL,
    classroom NVARCHAR(255),
    term_id VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (term_id) REFERENCES terms(term_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng course_teachers
CREATE TABLE course_teachers (
    course_teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(8) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng course_members
CREATE TABLE course_members (
    course_member_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng modules
CREATE TABLE modules (
    module_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    module_name NVARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE materials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    uploader_id VARCHAR(8),
    module_id INT DEFAULT NULL,
    material_type ENUM('document', 'video', 'link', 'zip') NOT NULL,
    title NVARCHAR(255) NOT NULL,
    status ENUM('public', 'private') DEFAULT 'public',
    FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE materials_files (
	file_id INT PRIMARY KEY auto_increment,
    material_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng assignments
CREATE TABLE assignments (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    module_id INT DEFAULT NULL,
    creator_id VARCHAR(8),
    title NVARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATETIME,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE SET NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng assignment_allowed_formats
CREATE TABLE assignment_allowed_formats (
    format_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    format VARCHAR(50) NOT NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- Bảng posts
CREATE TABLE posts (
    post_id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id VARCHAR(8),
    course_id VARCHAR(50) DEFAULT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng comments
CREATE TABLE comments (
    comment_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    creator_id VARCHAR(8),
    content TEXT NOT NULL,
    reply_to_comment INT DEFAULT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_comment) REFERENCES comments(comment_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng submissions
CREATE TABLE submissions (
    submission_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5, 2),
    feedback TEXT,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng notifications
CREATE TABLE notifications (
    notification_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    creator_id VARCHAR(8),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_global BOOLEAN DEFAULT 0,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- Bảng notification_courses
CREATE TABLE notification_courses (
    notification_id INT NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (notification_id, course_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng lưu file cho các bài tập
CREATE TABLE assignment_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng lưu file cho các bài đăng
CREATE TABLE post_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng lưu file cho các bài nộp
CREATE TABLE submission_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Bảng lưu file cho các thông báo
CREATE TABLE notification_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO users (user_id, password, full_name, role, email) VALUES 
('admin001',  '$2b$10$aFe8Ev6gBa92/bYrYIEta.bJFQ/CrFRMI7GSAJsLnpP7SUf/SJ9Oy', 'ctsv_dhcn', 'admin', 'ctsv_dhcn@vnu.edu.vn');


INSERT INTO `fall2024c8g10_educationsystem`.`terms` (`term_id`, `term_name`) VALUES ('2425H', 'SummerTerm 2024-2025');
INSERT INTO `fall2024c8g10_educationsystem`.`terms` (`term_id`, `term_name`) VALUES ('2425I', 'FallTerm 2024-2025');
INSERT INTO `fall2024c8g10_educationsystem`.`terms` (`term_id`, `term_name`) VALUES ('2425II', 'SpringTerm 2024-2025');

ALTER TABLE assignments
ADD COLUMN start_date DATETIME DEFAULT CURRENT_TIMESTAMP;


drop table assignment_allowed_formats;