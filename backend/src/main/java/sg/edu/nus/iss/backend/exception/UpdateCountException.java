package sg.edu.nus.iss.backend.exception;

public class UpdateCountException extends Exception{
    public UpdateCountException(){
        super();
    }

    public UpdateCountException(String message){
        super(message);
    }
}
