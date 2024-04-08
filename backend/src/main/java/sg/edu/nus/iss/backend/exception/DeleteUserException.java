package sg.edu.nus.iss.backend.exception;

public class DeleteUserException extends Exception{
    public DeleteUserException(){
        super();
    }

    public DeleteUserException(String message){
        super(message);
    }
}
