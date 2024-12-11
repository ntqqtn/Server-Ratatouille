-- Xóa database nếu đã tồn tại và tạo lại
DROP DATABASE IF EXISTS educationsystem;
CREATE DATABASE educationsystem CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE educationsystem;

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
);

-- Bảng terms
CREATE TABLE terms (
    term_id VARCHAR(50) PRIMARY KEY,
    term_name NVARCHAR(255)
);

-- Bảng courses
CREATE TABLE courses (
    course_id VARCHAR(50) PRIMARY KEY UNIQUE NOT NULL,
    course_name NVARCHAR(255) NOT NULL,
    classroom NVARCHAR(255),
    term_id VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (term_id) REFERENCES terms(term_id) ON DELETE CASCADE
);

-- Bảng course_teachers
CREATE TABLE course_teachers (
    course_teacher_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    teacher_id VARCHAR(8) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng course_members
CREATE TABLE course_members (
    course_member_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    student_id VARCHAR(8) NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng modules
CREATE TABLE modules (
    module_id INT PRIMARY KEY AUTO_INCREMENT,
    course_id VARCHAR(50) NOT NULL,
    module_name NVARCHAR(255) NOT NULL,
    description TEXT,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- -- Bảng materials
-- CREATE TABLE materials (
--     material_id INT PRIMARY KEY AUTO_INCREMENT,
--     course_id VARCHAR(50) NOT NULL,
--     uploader_id VARCHAR(8),
--     module_id INT DEFAULT NULL,
--     material_type ENUM('document', 'video', 'link', 'zip') NOT NULL,
--     title NVARCHAR(255) NOT NULL,
--     file_url VARCHAR(255), 
--     description TEXT,
--     upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
--     FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE SET NULL,
--     FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE SET NULL
-- );

CREATE TABLE materials (
    material_id INT PRIMARY KEY AUTO_INCREMENT,
    -- course_id VARCHAR(50) NOT NULL,
    uploader_id VARCHAR(8),
    module_id INT DEFAULT NULL,
    material_type ENUM('document', 'video', 'link', 'zip') NOT NULL,
    title NVARCHAR(255) NOT NULL,
    status ENUM('public', 'private') DEFAULT 'public',
    -- FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (module_id) REFERENCES modules(module_id) ON DELETE SET NULL
);
-- query to add column status to materials table
-- ALTER TABLE materials
-- ADD status ENUM('public', 'private') DEFAULT 'public';


CREATE TABLE materials_files (
	file_id INT PRIMARY KEY auto_increment,
    material_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (material_id) REFERENCES materials(material_id) ON DELETE CASCADE
);

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
);

-- Bảng assignment_allowed_formats
CREATE TABLE assignment_allowed_formats (
    format_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    format VARCHAR(50) NOT NULL,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE
);



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
);

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
);

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
);

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
);


-- Bảng notification_courses
CREATE TABLE notification_courses (
    notification_id INT NOT NULL,
    course_id VARCHAR(50) NOT NULL,
    PRIMARY KEY (notification_id, course_id),
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE CASCADE
);

-- Bảng lưu file cho các bài tập
CREATE TABLE assignment_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    assignment_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE
);

-- Bảng lưu file cho các bài đăng
CREATE TABLE post_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE
);

-- Bảng lưu file cho các bài nộp
CREATE TABLE submission_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    submission_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- Bảng lưu file cho các thông báo
CREATE TABLE notification_files (
    file_id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT NOT NULL,
    file_name NVARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(notification_id) ON DELETE CASCADE
);

INSERT INTO users (user_id, password, full_name, role, email) VALUES 
('admin001',  '$2b$10$aFe8Ev6gBa92/bYrYIEta.bJFQ/CrFRMI7GSAJsLnpP7SUf/SJ9Oy', 'Thân Việt Anh', 'admin', 'vietanh.vadc.2004@gmail.com'), 
('admin002',  '$2b$10$gBMKWuqjDfJJHiRLBgUwhOmh7GEVHfK8Jqp7yua4f1pLen/phKpLG', 'Nguyễn Thúy Quỳnh', 'admin', '22026559@vnu.edu.vn'),
('admin003',  '$2b$10$fv.d1sqVdcBwUiUPDRrlResZb39YmiZRtojURXfKl5jVn8H/MAYbS', 'Lê Thị Hà Phương', 'admin', '22026563@vnu.edu.vn'),
('admin004',  '$2b$10$Qb1MjNWHm3f9qaqYBo0AM.hX4mUK3F55KNh81daN9PweSGAgRQiZi', 'Nguyễn Hương Giang', 'admin', '22026566@vnu.edu.vn');

INSERT INTO `educationsystem`.`terms` (`term_id`, `term_name`) VALUES ('2425H', 'Học kỳ hè năm học 2024-2025');
INSERT INTO `educationsystem`.`terms` (`term_id`, `term_name`) VALUES ('2425I', 'Học kỳ I năm học 2024-2025');
INSERT INTO `educationsystem`.`terms` (`term_id`, `term_name`) VALUES ('2425II', 'Học kỳ II năm học 2024-2025');
