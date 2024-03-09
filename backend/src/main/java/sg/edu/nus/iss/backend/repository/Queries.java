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
    
}
