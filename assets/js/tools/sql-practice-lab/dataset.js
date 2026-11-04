/* =========================================================
   ToolZen Hub
   SQL Practice Lab: the practice database

   Four small tables of an imaginary shop, written once here. Every check starts from a brand-new in-memory copy, so
   nothing a learner runs can change the next check.
========================================================= */

export const SETUP = [
    "CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT NOT NULL, city TEXT NOT NULL, joined TEXT);",
    "INSERT INTO customers VALUES\n (1,'Asha Rao','Pune','2023-01-15'),\n (2,'Bilal Khan','Mumbai','2023-02-03'),\n (3,'Chitra Iyer','Chennai','2023-02-20'),\n (4,'Arjun Mehta','Pune','2023-03-11'),\n (5,'Divya Nair','Kochi','2023-04-02'),\n (6,'Farhan Ali','Mumbai','2023-05-19'),\n (7,'Gita Sharma','Delhi','2023-06-07'),\n (8,'Anil Kumar','Delhi',NULL),\n (9,'Hari Prasad','Chennai','2023-08-25'),\n (10,'Isha Patel','Ahmedabad','2023-09-14'),\n (11,'Jatin Verma','Pune','2023-10-30'),\n (12,'Kavya Reddy','Hyderabad','2023-11-21');",
    "CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL, price INTEGER NOT NULL);",
    "INSERT INTO products VALUES\n (1,'Notebook','Stationery',60),\n (2,'Ballpoint Pen','Stationery',10),\n (3,'Desk Lamp','Home',450),\n (4,'Backpack','Bags',1200),\n (5,'Water Bottle','Home',350),\n (6,'Calculator','Electronics',700),\n (7,'Headphones','Electronics',1800),\n (8,'Marker Set','Stationery',150),\n (9,'Laptop Stand','Electronics',950),\n (10,'Lunch Box','Home',280);",
    "CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER NOT NULL, order_date TEXT NOT NULL, status TEXT NOT NULL);",
    "INSERT INTO orders VALUES\n (1,1,'2024-01-05','delivered'),\n (2,1,'2024-01-20','delivered'),\n (3,2,'2024-01-22','shipped'),\n (4,3,'2024-02-02','delivered'),\n (5,4,'2024-02-10','cancelled'),\n (6,1,'2024-02-14','delivered'),\n (7,5,'2024-02-28','delivered'),\n (8,6,'2024-03-03','shipped'),\n (9,2,'2024-03-09','delivered'),\n (10,7,'2024-03-15','pending'),\n (11,9,'2024-03-22','delivered'),\n (12,4,'2024-04-01','delivered'),\n (13,10,'2024-04-08','shipped'),\n (14,1,'2024-04-19','pending'),\n (15,3,'2024-04-25','delivered'),\n (16,6,'2024-05-06','delivered'),\n (17,9,'2024-05-18','cancelled'),\n (18,2,'2024-05-30','delivered'),\n (19,11,'2024-06-12','shipped'),\n (20,4,'2024-06-21','delivered');",
    "CREATE TABLE order_items (order_id INTEGER NOT NULL, product_id INTEGER NOT NULL, quantity INTEGER NOT NULL);",
    "INSERT INTO order_items VALUES\n (1,1,3),(1,2,5),(2,4,1),(3,7,1),(3,2,2),(4,3,1),(4,5,1),(5,6,2),(6,8,2),(6,1,4),\n (7,9,1),(8,10,3),(9,4,1),(9,7,1),(10,2,10),(11,5,2),(11,10,1),(12,6,1),(13,8,1),(13,3,2),\n (14,1,2),(15,9,1),(15,2,5),(16,4,1),(17,7,1),(18,3,1),(18,6,1),(19,5,1),(20,8,3),(20,10,2),(20,1,1);"
];
