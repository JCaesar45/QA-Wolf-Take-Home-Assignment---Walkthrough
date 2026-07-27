import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class HackerNewsValidator {
    private static final String BASE_URL = "https://hacker-news.firebaseio.com/v0";
    private static final ObjectMapper mapper = new ObjectMapper();
    private static final HttpClient client = HttpClient.newHttpClient();

    public static void main(String[] args) throws Exception {
        System.out.println(validateSort().get());
    }

    private static CompletableFuture<String> validateSort() {
        HttpRequest idsRequest = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/newstories.json"))
                .GET()
                .build();

        return client.sendAsync(idsRequest, HttpResponse.BodyHandlers.ofString())
                .thenApply(HttpResponse::body)
                .thenApply(body -> {
                    try {
                        JsonNode node = mapper.readTree(body);
                        int[] ids = new int[100];
                        for (int i = 0; i < 100; i++) {
                            ids[i] = node.get(i).asInt();
                        }
                        return ids;
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .thenCompose(ids -> {
                    List<CompletableFuture<Integer>> timeFutures = Arrays.stream(ids)
                            .mapToObj(id -> {
                                HttpRequest itemReq = HttpRequest.newBuilder()
                                        .uri(URI.create(BASE_URL + "/item/" + id + ".json"))
                                        .GET()
                                        .build();
                                return client.sendAsync(itemReq, HttpResponse.BodyHandlers.ofString())
                                        .thenApply(HttpResponse::body)
                                        .thenApply(itemBody -> {
                                            try {
                                                return mapper.readTree(itemBody).get("time").asInt();
                                            } catch (Exception e) {
                                                throw new RuntimeException(e);
                                            }
                                        });
                            })
                            .collect(Collectors.toList());

                    return CompletableFuture.allOf(timeFutures.toArray(new CompletableFuture[0]))
                            .thenApply(v -> {
                                int[] times = new int[100];
                                for (int i = 0; i < 100; i++) {
                                    times[i] = timeFutures.get(i).join();
                                }
                                for (int i = 1; i < times.length; i++) {
                                    if (times[i] > times[i - 1]) {
                                        return "Failure: Sort order violated at index " + i;
                                    }
                                }
                                return "Success: First 100 articles are sorted from newest to oldest.";
                            });
                });
    }
}
