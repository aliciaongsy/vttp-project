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

create table telegram_bot (
   chatid varchar(64) not null,
   username varchar(64) not null,
   email varchar(128) not null unique,
   id char(8) not null,
   insertdate timestamp default current_timestamp,
   
   primary key(chatid),
   foreign key (email) references user_details(email),
   foreign key (id) references user_details(id)
);

create table task_data (
   id char(8) not null,
   complete int default 0,
   incomplete int default 0,
   total int default 0,

   primary key(id),
   foreign key(id) references user_details(id)
);

grant all privileges on tasksync.* to fred@'%';
flush privileges;