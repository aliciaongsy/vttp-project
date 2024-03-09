drop database if exists tasksync;

create database tasksync;

use tasksync;

create table user_details (
   id char(8) not null,
   name varchar(64) not null,
   email varchar(128) not null unique,
   password varchar(128) not null,
   salt varchar(128) not null,
   
   primary key(id)
);

grant all privileges on tasksync.* to fred@'%';
flush privileges;