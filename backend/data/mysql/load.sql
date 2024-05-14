USE DOGS_DATABASE_MYSQL;

LOAD DATA LOCAL INFILE '/root/data/breeds_d.csv'
INTO TABLE breeds
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA LOCAL INFILE '/root/data/dogs_d.csv'
INTO TABLE dogs
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(dog_id, dog_name, breed_id, color, weight, @birth_date, @adopted_date, @acquired_date)
SET birth_date = STR_TO_DATE(@birth_date, '%m/%d/%Y'),
    adopted_date = STR_TO_DATE(@adopted_date, '%m/%d/%Y'),
    acquired_date = STR_TO_DATE(@acquired_date, '%m/%d/%Y');

LOAD DATA LOCAL INFILE '/root/data/owners_d.csv'
INTO TABLE owners
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES;

LOAD DATA LOCAL INFILE '/root/data/adoptions_d.csv'
INTO TABLE adoptions
FIELDS TERMINATED BY ',' 
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(adoption_id, owner_id, dog_id, @adoption_date)
SET adoption_date = STR_TO_DATE(@adoption_date, '%m/%d/%Y');
SHOW WARNINGS;