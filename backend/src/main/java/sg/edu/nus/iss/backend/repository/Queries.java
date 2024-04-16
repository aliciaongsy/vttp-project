package sg.edu.nus.iss.backend.repository;

public class Queries {

    public final static String SQL_ADD_USER = """
        insert into user_details(id, name, email, password, salt)
        values (?, ?, ?, ?, ?);
        """;

    public final static String SQL_FIND_USER_BY_EMAIL = """
        select * from user_details 
        where email=?
        """;

    public final static String SQL_FIND_USER_BY_EMAIL_AND_ID = """
        select * from user_details 
        where email=? and id=?
        """;
    
    public final static String SQL_ADD_TELEGRAM_ACCOUNT = """
        insert into telegram_bot(chatid, username, email, id)
        values (?, ?, ?, ?)
        """;

    public final static String SQL_FIND_USER_BY_CHATID = """
        select * from telegram_bot
        where chatid=?
        """;

    public final static String SQL_GET_USERID_BY_CHATID = """
        select id from telegram_bot
        where chatid=?
        """;

    public final static String SQL_GET_CHATID_BY_USERID = """
        select chatid from telegram_bot
        where id=?
        """;

    public final static String SQL_GET_TASK_DATA_BY_ID = """
        select * from task_data
        where id=?
        """;

    public final static String SQL_UPDATE_USER = """
        update user_details set name=?, email=?, image=?
        where id=?
        """;

    public final static String SQL_CHANGE_PASSWORD = """
        update user_details set password=?, salt=?
        where email=?
        """;

    public final static String SQL_DELETE_USER = """
        delete from user_details
        where id=?
        """;

    public final static String SQL_DELETE_TELEGRAM_USER = """
        delete from telegram_bot
        where id=?
        """;

    public final static String SQL_DELETE_TASK_BY_USER = """
        delete from task_data
        where id=?
        """;

    public final static String SQL_INCREMENT_TASK_COUNT = """
        update task_data set total = total + 1
        where id=?
        """;

    public final static String SQL_INCREMENT_COMPLETE_COUNT = """
        update task_data set complete = complete + 1
        where id=?
        """;

    public final static String SQL_INCREMENT_INCOMPLETE_COUNT = """
        update task_data set incomplete = incomplete + 1
        where id=?
        """;

    public final static String SQL_DECREASE_TASK_COUNT = """
        update task_data set total = total - 1
        where id=?
        """;

    public final static String SQL_DECREASE_COMPLETE_COUNT = """
        update task_data set complete = complete - 1
        where id=?
        """;

    public final static String SQL_DECREASE_INCOMPLETE_COUNT = """
        update task_data set incomplete = incomplete - 1
        where id=?
        """;

    public final static String SQL_DECREASE_TASK_COUNT_BY_VALUE = """
        update task_data set total = total - ?
        where id=?
        """;

    public final static String SQL_DECREASE_COMPLETE_COUNT_BY_VALUE = """
        update task_data set complete = complete - ?
        where id=?
        """;

    public final static String SQL_DECREASE_INCOMPLETE_COUNT_BY_VALUE = """
        update task_data set incomplete = incomplete - ?
        where id=?
        """;

    public final static String SQL_INSERT_COUNT = """
        insert into task_data(id, complete, incomplete, total)
        values (?, ?, ?, 1);
        """;
}
