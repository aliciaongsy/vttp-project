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

    public final static String SQL_GET_TASK_DATA_BY_ID = """
        select * from task_data
        where id=?
        """;
}
