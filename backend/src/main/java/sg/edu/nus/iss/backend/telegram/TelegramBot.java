package sg.edu.nus.iss.backend.telegram;

import static org.telegram.abilitybots.api.objects.Locality.USER;
import static org.telegram.abilitybots.api.objects.Privacy.PUBLIC;
import static org.telegram.abilitybots.api.util.AbilityUtils.getChatId;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
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
    private String taskId;
    private String varToEdit;

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
                    if (linked) {
                        id = teleSvc.getUserIdByChatId(ctx.chatId());
                        System.out.println(id);
                    }
                    List<String> workspaces = teleSvc.getWorkspacesById(id);
                    responseHandler.replyToWorkspaces(ctx.chatId(), linked, workspaces);
                })
                .build();
    }

    public Ability editTasksAbility(){
        return Ability
                .builder()
                .name("edit")
                .info("edit task")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> {
                    boolean linked = teleSvc.checkLinkedAccount(ctx.chatId());
                    if (linked) {
                        id = teleSvc.getUserIdByChatId(ctx.chatId());
                        System.out.println(id);
                    }
                    List<String> workspaces = teleSvc.getWorkspacesById(id);
                    responseHandler.replyToEditTask(ctx.chatId(), linked, workspaces);
                })
                .build();
    }

    public Ability dueSoonAbility(){
        return Ability
                .builder()
                .name("duesoon")
                .info("task due soon")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> {
                    boolean linked = teleSvc.checkLinkedAccount(ctx.chatId());
                    if (linked) {
                        id = teleSvc.getUserIdByChatId(ctx.chatId());
                        System.out.println(id);
                    }
                    responseHandler.replyToDueSoon(ctx.chatId(), linked, teleSvc.getTaskDueSoon(), teleSvc.getTaskDueSoonWorkspace());
                })
                .build();
    }

    public Ability overdueTaskAbility(){
        return Ability
                .builder()
                .name("overduetask")
                .info("overdue task")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> {
                    boolean linked = teleSvc.checkLinkedAccount(ctx.chatId());
                    if (linked) {
                        id = teleSvc.getUserIdByChatId(ctx.chatId());
                        System.out.println(id);
                    }
                    responseHandler.replyToOverdueTask(ctx.chatId(), linked, teleSvc.getOverdueTask(), teleSvc.getOverdueTaskWorkspace());
                })
                .build();
    }

    public Ability stopBot() {
        return Ability
                .builder()
                .name("stop")
                .info("stop bot")
                .locality(USER)
                .privacy(PUBLIC)
                .action(ctx -> responseHandler.replyToStop(ctx.chatId()))
                .build();
    }

    @Override
    public void onUpdateReceived(Update update) {
        super.onUpdateReceived(update);
        if (update.hasCallbackQuery()) {
            switch (update.getCallbackQuery().getData()) {
                case "edit":
                    int messageId = update.getCallbackQuery().getMessage().getMessageId();
                    responseHandler.replyToEdit(getChatId(update), messageId);
                    break;

                case "markcomplete":
                    // get task details
                    String text = update.getCallbackQuery().getMessage().getText();

                    String[] split = text.split("\n");

                    // get task id
                    String id = split[1];
                    this.taskId = id.split(":")[1].trim();

                    // get complete boolean
                    String complete = split[7];
                    boolean completeStatus = Boolean.valueOf(complete.split(":")[1].trim());
                    System.out.println(completeStatus);

                    if (completeStatus) {
                        responseHandler.replyToCompletedTask(getChatId(update), completeStatus, false);
                    } else {
                        boolean updated = teleSvc.updateCompleteStatus(this.id, selectedWorkspace, this.taskId, true);
                        responseHandler.replyToCompletedTask(getChatId(update), completeStatus, updated);
                    }

                    break;

                // edit task details
                case "task":
                case "status":
                case "priority":
                case "start":
                case "due":
                case "complete":
                case "back":
                    // variable chosen to make edit
                    this.varToEdit = update.getCallbackQuery().getData();
                    this.taskId = update.getCallbackQuery().getMessage().getText().split("\n")[1].split(":")[1].trim();
                    int msgId = update.getCallbackQuery().getMessage().getMessageId();
                    responseHandler.replyToEditVariable(getChatId(update), this.varToEdit, msgId);
                    break;

                default:
                    break;
            }

        }
    }

    public Reply replyToButtons() {
        BiConsumer<BaseAbilityBot, Update> action = (abilityBot, upd) -> {

            if (upd.getMessage().getText().equals("/stop")) {
                responseHandler.replyToButtons(getChatId(upd), upd.getMessage(), Optional.empty());
            }

            State state = responseHandler.getChatStates().get(getChatId(upd));
            System.out.println(state);

            switch (state) {
                case State.AWAITING_EMAIL:
                    if (upd.getMessage().getText().length() > 5) {
                        email = upd.getMessage().getText();
                        boolean existingUser = teleSvc.checkUserExistInDatabase(email);
                        // user does not exist in db
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
                    // invalid id
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

                case State.AWAITING_EDIT:
                    String value = upd.getMessage().getText();
                    boolean updated = false;
                    System.out.println(this.varToEdit);
                    switch (this.varToEdit) {
                        case "complete":
                            updated = teleSvc.updateCompleteStatus(this.id, selectedWorkspace, this.taskId,
                                    Boolean.valueOf(value));
                            break;

                        // validation
                        case "task":
                            if (value.length() < 3) {
                                System.out.println("minimum 3 characters!");
                                responseHandler.replyToValidationError(getChatId(upd), "task length");

                            } else {
                                updated = teleSvc.updateTaskDetails(this.id, selectedWorkspace, this.taskId,
                                        this.varToEdit, value);
                            }
                            break;

                        case "start":
                        case "due":
                            // validation check 1 - check if value matches "dd/MM/yyyy" format
                            if (!value.matches("\\d{2}/\\d{2}/\\d{4}")) {
                                // failed validation check 1
                                System.out.println("pattern mismatched");
                                responseHandler.replyToValidationError(getChatId(upd), "date format");
                            }
                            // passed validation check 1
                            else {
                                if (this.varToEdit.equals("due")) {
                                    SimpleDateFormat format = new SimpleDateFormat("dd/MM/yyyy");
                                    try {
                                        Date date = format.parse(value);
                                        // validation check 2 - check if due date is earlier than today
                                        if (date.getTime() < new Date().getTime()) {
                                            // failed validation check 2
                                            System.out.println("due date cannot be before today");
                                            responseHandler.replyToValidationError(getChatId(upd), "past date");

                                        }
                                        // passed validation check 2
                                        else {
                                            // only update repo if both validation passed
                                            updated = teleSvc.updateTaskDetails(this.id, selectedWorkspace, this.taskId,
                                                    this.varToEdit, value);
                                        }
                                    } catch (ParseException e) {
                                        e.printStackTrace();
                                    }
                                } else {
                                    // for the case of "start" - only need to pass validation check 1
                                    updated = teleSvc.updateTaskDetails(this.id, selectedWorkspace, this.taskId,
                                            this.varToEdit, value);
                                }
                            }
                            break;

                        default:
                            updated = teleSvc.updateTaskDetails(this.id, selectedWorkspace, this.taskId, this.varToEdit,
                                    value);
                            break;
                    }
                    System.out.println(updated);
                    // successful update
                    if (updated) {
                        // get updated tasks after making edits
                        List<Task> tasksList = teleSvc.getAllTasks(id, selectedWorkspace);
                        responseHandler.replyToButtons(getChatId(upd), upd.getMessage(),
                                Optional.ofNullable(tasksList));
                    }
                    // unsuccessful update
                    else {
                        responseHandler.replyToButtons(getChatId(upd), upd.getMessage(), Optional.empty());
                    }
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
