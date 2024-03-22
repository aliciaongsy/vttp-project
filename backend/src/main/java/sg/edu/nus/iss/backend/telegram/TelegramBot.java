package sg.edu.nus.iss.backend.telegram;

import static org.telegram.abilitybots.api.objects.Locality.USER;
import static org.telegram.abilitybots.api.objects.Privacy.PUBLIC;
import static org.telegram.abilitybots.api.util.AbilityUtils.getChatId;

import java.util.List;
import java.util.Optional;
import java.util.function.BiConsumer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.telegram.abilitybots.api.bot.AbilityBot;
import org.telegram.abilitybots.api.bot.BaseAbilityBot;
import org.telegram.abilitybots.api.objects.Ability;
import org.telegram.abilitybots.api.objects.Flag;
import org.telegram.abilitybots.api.objects.Reply;
import org.telegram.telegrambots.meta.api.objects.Update;

import sg.edu.nus.iss.backend.model.Task;
import sg.edu.nus.iss.backend.service.TelegramService;

@Component
public class TelegramBot extends AbilityBot {

    private final ResponseHandler responseHandler;

    @Autowired
    private TelegramService teleSvc;

    // account details
    private String email;
    private String id;

    // tasks detail
    private String selectedWorkspace;

    public TelegramBot(Environment environment) {
        super(environment.getProperty("telegram.bot.token"), "tasks_sync_bot");
        responseHandler = new ResponseHandler(silent, db);
    }

    public Ability startBot() {
        return Ability
                .builder()
                .name("start")
                .info("start bot")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> {
                    boolean linked = teleSvc.checkLinkedAccount(ctx.chatId());
                    System.out.println(linked);
                    if (linked) {
                        responseHandler.accountLinked(ctx.chatId(), ctx.user().getFirstName());
                    } else {
                        responseHandler.replyToStart(ctx.chatId(), ctx.user().getFirstName());
                    }
                })
                .build();
    }

    public Ability linkBot() {
        return Ability
                .builder()
                .name("linkaccount")
                .info("link account")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> responseHandler.replyToLinkAccount(ctx.chatId()))
                .build();
    }

    public Ability getWorkspacesAbility() {
        return Ability
                .builder()
                .name("workspaces")
                .info("get all workspaces")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> {
                    boolean linked = teleSvc.checkLinkedAccount(ctx.chatId());
                    if (linked){
                        id = teleSvc.getUserIdByChatId(ctx.chatId());
                    }
                    List<String> workspaces = teleSvc.getWorkspacesById(id);
                    responseHandler.replyToWorkspaces(ctx.chatId(), linked, workspaces);
                })
                .build();
    }

    @Override
    public void onUpdateReceived(Update update) {
        super.onUpdateReceived(update);
        if(update.hasCallbackQuery()){
            switch (update.getCallbackQuery().getData()) {
                case "edit":
                    
                    break;

                case "markcomplete":

                    break;
            
                default:
                    break;
            }
                
        }
    }

    public Reply replyToButtons() {
        BiConsumer<BaseAbilityBot, Update> action = (abilityBot, upd) -> {
            
            State state = responseHandler.getChatStates().get(getChatId(upd));
            System.out.println(state);

            switch (state) {
                case State.AWAITING_EMAIL:
                    if (upd.getMessage().getText().length() > 5) {
                        email = upd.getMessage().getText();
                        boolean existingUser = teleSvc.checkUserExistInDatabase(email);
                        if (!existingUser) {
                            responseHandler.checkEmail(getChatId(upd));
                            break;
                        }
                        responseHandler.replyToButtons(getChatId(upd), upd.getMessage(), Optional.empty());
                    }
                    break;

                case State.AWAITING_ID:
                    id = upd.getMessage().getText();
                    boolean validId = teleSvc.checkUserId(email, upd.getMessage().getText());
                    if (!validId) {
                        responseHandler.checkId(getChatId(upd));
                        break;
                    }
                    teleSvc.addTelegramDetails(getChatId(upd), upd.getMessage().getFrom().getUserName(), email,
                            upd.getMessage().getText());
                    responseHandler.replyToButtons(getChatId(upd), upd.getMessage(), Optional.empty());
                    break;      

                case State.AWAITING_WORKSPACE_SELECTION:
                    selectedWorkspace = upd.getMessage().getText();
                    List<Task> tasks = teleSvc.getAllTasks(id, selectedWorkspace);
                    responseHandler.replyToButtons(getChatId(upd), upd.getMessage(), Optional.ofNullable(tasks));
                    break;

                default:
                    responseHandler.replyToButtons(getChatId(upd), upd.getMessage(), Optional.empty());
                    break;
            }
        };
        return Reply.of(action, Flag.TEXT, upd -> responseHandler.userIsActive(getChatId(upd)));
    }

    @Override
    public long creatorId() {
        return 1L;
    }

}
