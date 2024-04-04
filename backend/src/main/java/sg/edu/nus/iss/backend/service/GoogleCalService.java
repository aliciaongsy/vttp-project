package sg.edu.nus.iss.backend.service;

import java.io.StringReader;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.google.api.client.auth.oauth2.AuthorizationCodeRequestUrl;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets.Details;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.Calendar.Events;
import com.google.api.services.calendar.CalendarScopes;

import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;

@Service
public class GoogleCalService {

    private static final String APPLICATION_NAME = "task collab";
    private static HttpTransport httpTransport;
    private static final JsonFactory JSON_FACTORY = JacksonFactory.getDefaultInstance();
    private static Calendar client;

    GoogleClientSecrets clientSecrets;
    GoogleAuthorizationCodeFlow flow;
    Credential credential;

    @Value("${google.client.client.id}")
    private String clientId;

    @Value("${google.client.client.secret}")
    private String clientSecret;

    @Value("${google.client.redirectUri}")
    private String redirectURI;

    @Value("${google.api.key}")
    private String apiKey;

    private static String baseUrl = "https://www.googleapis.com/calendar/v3/calendars";

    final DateTime date1 = new DateTime("2017-05-05T16:30:00.000+05:30");
    final DateTime date2 = new DateTime(new Date());

    // private Set<Event> events = new HashSet<>();

    // public void setEvents(Set<Event> events) {
    //     this.events = events;
    // }

    public String authorize() throws Exception {
        AuthorizationCodeRequestUrl authorizationUrl;
        if (flow == null) {
            Details web = new Details();
            web.setClientId(clientId);
            web.setClientSecret(clientSecret);
            clientSecrets = new GoogleClientSecrets().setWeb(web);
            httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            Collection<String> scopes = new HashSet<>();
            scopes.add(CalendarScopes.CALENDAR);
            scopes.add(CalendarScopes.CALENDAR_EVENTS);
            scopes.add("https://www.googleapis.com/auth/userinfo.email");
            flow = new GoogleAuthorizationCodeFlow.Builder(httpTransport, JSON_FACTORY, clientSecrets, scopes).build();
        }

        authorizationUrl = flow.newAuthorizationUrl().setRedirectUri(redirectURI);

        System.out.println("cal authorizationUrl->" + authorizationUrl);
        return authorizationUrl.build();
    }

    public boolean getTokenStatus(String code, String userId) {
        com.google.api.services.calendar.model.Events eventList;
        String message;
        try {

            TokenResponse response = flow.newTokenRequest(code).setRedirectUri(redirectURI).execute();
            System.out.println("token response:" + response.toPrettyString());
            credential = flow.createAndStoreCredential(response, userId);
            client = new Calendar.Builder(httpTransport, JSON_FACTORY, credential)
                    .setApplicationName(APPLICATION_NAME).build();
            // Events events = client.events();
            // eventList = events.list("primary").setTimeMin(date1).setTimeMax(date2).execute();
            // message = eventList.getItems().toString();
            // System.out.println("My:" + eventList.getItems());
            // System.out.println("cal message:" + message);
            return true;

        } catch (Exception e) {

            message = "Exception while handling OAuth2 callback (" + e.getMessage() + ")."
                    + " Redirecting to google connection status page.";
            return false;
        }
    }

    public String getEmail(){

        String emailUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

        String url = UriComponentsBuilder.fromUriString(emailUrl)
                .queryParam("access_token",credential.getAccessToken())
                .toUriString();

        RequestEntity<Void> req = RequestEntity.get(url).build();

        RestTemplate template = new RestTemplate();

        ResponseEntity<String> resp = template.exchange(req, String.class);

        JsonReader jsonReader = Json.createReader(new StringReader(resp.getBody()));
        JsonObject jsonObject = jsonReader.readObject();

        System.out.println("-----EMAIL-----\n" + jsonObject);

        String email = jsonObject.getString("email");

        return email;
    }

    public void getEvents(){

        String eventUrl = baseUrl+"/primary/events";

        String url = UriComponentsBuilder.fromUriString(eventUrl)
                .queryParam("key", apiKey)
                .toUriString();

        System.out.printf("querying from %s\n", url);

        String authorisation = "Bearer "+credential.getAccessToken();

        System.out.printf("authorisation header: %s\n", authorisation);

        RequestEntity<Void> req = RequestEntity.get(url)
            .accept(MediaType.APPLICATION_JSON)
            .header("Authorization", authorisation)
            .build();

        RestTemplate template = new RestTemplate();

        ResponseEntity<String> resp = template.exchange(req, String.class);

        JsonReader jsonReader = Json.createReader(new StringReader(resp.getBody()));
        JsonObject jsonObject = jsonReader.readObject();

        System.out.println("-----JSONOBJECT-----\n" + jsonObject);
    }

    // public Set<Event> getEvents() throws IOException {
    //     return this.events;
    // }
}
