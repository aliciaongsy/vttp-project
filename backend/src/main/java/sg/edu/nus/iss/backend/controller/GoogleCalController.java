package sg.edu.nus.iss.backend.controller;

import java.io.StringReader;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.servlet.http.HttpServletRequest;
import sg.edu.nus.iss.backend.model.Event;
import sg.edu.nus.iss.backend.service.GoogleCalService;

@Controller
@CrossOrigin(origins = "*")
public class GoogleCalController {

	@Autowired
	private GoogleCalService googleSvc;

	private boolean authStatus;
	private String userId;
	private String email;

	@GetMapping("/google/auth/login")
	public ResponseEntity<String> googleConnectionStatus(HttpServletRequest request,
			@RequestParam(value = "id") String id) throws Exception {

		userId = id;
		String url = googleSvc.authorize();

		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add("url", url);

		return ResponseEntity.ok(builder.build().toString());
	}

	@GetMapping("/google/auth/callback")
	public RedirectView oauth2Callback(@RequestParam(value = "code") String code) {

		authStatus = googleSvc.getTokenStatus(code, userId);
		email = googleSvc.getEmail();

		if (authStatus) {
			return new RedirectView("http://localhost:8080/google/auth/success");
		} else {
			return new RedirectView("http://localhost:8080/google/auth/error");
		}

	}

	@GetMapping("/google/auth/success")
	@ResponseBody
	public String success() {
		return "Successful authorisation, you may close this tab";
	}

	@GetMapping("/google/auth/error")
	@ResponseBody
	public String error() {
		return "Unsuccessful authorisation, you may close this tab and retry";
	}

	@GetMapping("google/auth/status")
	@ResponseBody
	public ResponseEntity<String> getStatus() {

		JsonObjectBuilder builder = Json.createObjectBuilder();
		builder.add("status", authStatus)
				.add("email", email == null ? "" : email);
		return ResponseEntity.status(authStatus ? HttpStatusCode.valueOf(200) : HttpStatusCode.valueOf(400))
				.body(builder.build().toString());
	}

	@GetMapping("google/events")
	@ResponseBody
	public ResponseEntity<String> getEvents() {
		List<Event> events = googleSvc.getEvents();

		JsonArrayBuilder builder = Json.createArrayBuilder();
		for (Event e : events) {
			builder.add(e.toJson2(e));
		}
		return ResponseEntity.ok(builder.build().toString());
	}

	@PostMapping("google/event/create")
	@ResponseBody
	public ResponseEntity<String> createEvent(@RequestBody String payload) {

		JsonReader reader = Json.createReader(new StringReader(payload));
		System.out.println(payload);

		JsonObject o = reader.readObject();
		Event event = new Event();
		event.setTitle(o.getString("title"));
		event.setStart(o.getString("start"));
		event.setEnd(o.getString("end"));
		event.setAllDay(o.getBoolean("allDay"));

		googleSvc.createEvent(event);

		return null;
	}

}
