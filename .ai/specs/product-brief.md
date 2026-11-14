# Pit Wall Crew (ściana boksów) — product brief

- Date: 2026-11-14
- Mode: existing; Owner: brief przygotował zewnętrzny kontrybutor; właściciel produktu: Maciej Szczepaniak (nie uczestniczył w sesji); Pass: full
- Evidence basis: kod i dokumenty w tym repozytorium (strona `index.html`, reguły bazy `database.rules.json`, instrukcja, strona prywatności, „Co nowego”) oraz dwie decyzje z sesji 2026-11-14. Brak wywiadów z użytkownikami, danych o użyciu i zgłoszeń. Liczba użytkowników to szacunek prowadzącego sesję, nie pomiar. Brief opisuje to, co istnieje; nie dowodzi, czego użytkownicy potrzebują.
- Coverage: 35 claims — 33 sourced (interview 0, data 0, document 3, product 30, benchmark 0), 0 synthetic, 2 assumed; 2 entries on the collection plan
- Synthetic hypotheses outside Coverage: 0
- Definition of Ready signed by: nie podpisano — brakuje potwierdzenia reguł R01–R06 (Q02) i decyzji D01–D02 przez właściciela (Q03); ready for: opisu stanu istniejącego (dokumentacja); nie dla planowania nowych funkcji
- Sources: `index.html`, `database.rules.json`, `instrukcja.html`, `prywatnosc.html`, `zmiany.html`, `README.md`, `.ai/specs/research/decisions/D01-zakres-briefu.md`, `.ai/specs/research/decisions/D02-odroczenie-resize.md`

## Decision summary

Decyzja tej sesji: scharakteryzować projekt i udokumentować to, co istnieje — tylko ścianę boksów z tego repozytorium, bez programu na komputer (D01 — propozycja zewnętrznego kontrybutora; czeka na potwierdzenie właściciela, Macieja Szczepaniaka: Q03).

Ściana boksów to strona w przeglądarce, na której zespół Le Mans Ultimate (i Assetto Corsa) widzi na żywo dane auta wysyłane przez program kierowcy, planuje stinty, rozmawia z inżynierem AI i przegląda okrążenia (zob. *Product*, *Key flows*). Kto i ilu ludzi z niej korzysta, wiemy tylko z szacunku: „kilkadziesiąt osób” (A01).

Brief nie zawiera problemów potwierdzonych przez użytkowników. Jedyny zgłoszony w sesji problem — wolne przerysowanie po zmianie rozmiaru okna — odłożono na później (D02, Q01).

Najważniejsza niewiadoma: faktyczna liczba użytkowników i to, na co się skarżą. Oba źródła już istnieją u autora — licznik instalacji na serwerze aktualizacji i zgłoszenia w bazie (*Collection plan*). Następny krok: właściciel potwierdza reguły R01–R06 jako zamierzone i decyduje, czy zebrać te dane przed wyborem kolejnych prac.

## Vision

Kierunek zespołu: cały zespół wyścigowy — kierowca za kierownicą, koledzy czekający na zmianę i widzowie — widzi w jednym miejscu stan auta, rywali, pogodę i grafik zmian, a z kierowcą rozmawia przez inżyniera. `[PRODUCT]` `instrukcja.html` („Co to jest”)

## Target group and stakeholders

- Customer (pays): użytkownicy programu na komputer (wersja pełna, demo, Patreon); ściana boksów jest częścią tego samego produktu. Model płatności poza zakresem tego briefu (D01). `[PRODUCT]` `instrukcja.html` („Pełna wersja i demo”, „Aktualizacje i Patreon”)
- User (uses): zespoły jeżdżące wspólnie w Le Mans Ultimate i Assetto Corsa, w tym długie wyścigi (np. 24 h) ze zmianami kierowców. `[PRODUCT]` `instrukcja.html` („Długi wyścig”, „Assetto Corsa”)
- User (uses): obserwatorzy spoza zespołu z linkiem tylko do podglądu. `[PRODUCT]` `index.html:568–571`
- Liczba użytkowników: „kilkadziesiąt osób, używają tego i działa” — szacunek prowadzącego sesję, bez pomiaru. `[ASSUMPTION]` sesja 2026-11-14; zob. A01
- Stakeholders: autor Maciej Szczepaniak (FR Mods) i dwóch testerów wymienionych w stopce. `[PRODUCT]` stopka `index.html`
- Decider for scope decisions: Maciej Szczepaniak — wskazany jako właściciel przez prowadzącego sesję, zewnętrznego kontrybutora, który nie decyduje w jego imieniu (Q03)

## Problems, with evidence

- Brak udokumentowanych problemów użytkowników w materiale. Repozytorium nie zawiera zgłoszeń; trafiają one do bazy (`feedback`) i prywatnego repozytorium autora. `[PRODUCT]` `database.rules.json` (`feedback`), `prywatnosc.html`
- Wolne przerysowanie strony po zmianie rozmiaru okna — zgłoszone w sesji bez opisu sytuacji; odłożone (D02, Q01).

## Product and how it stands out

- What it is: statyczna strona (GitHub Pages) z bazą Google Firebase Realtime Database; dane na żywo wysyła program kierowcy, strona je pokazuje i zapisuje plan, wiadomości oraz ustawienia zespołu. `[PRODUCT]` `README.md`, `index.html:11–13`
- Zakładki: Na żywo, Grafik i plan, Zespół, Okrążenia, Pamięć, Pomoc. `[PRODUCT]` `index.html:391–398`
- Na żywo: wyścig i okrążenia, odstępy w klasie z trendem, następny pitstop (paliwo, energia), sektory, opony i uszkodzenia, pogoda, zmęczenie kierowcy, fair share, pitstopy, limity toru i kary, rywale w klasie (lider + 4 przed i 4 za), porównanie z kolegą, radio zespołu, grafik stintów, mapa toru z pozycjami aut. `[PRODUCT]` `index.html:454–580`
- Radio zespołu: wiadomość „Do kierowcy” czytana głosem przez inżyniera, pytanie do inżyniera z odpowiedzią w radiu, pytanie tylko tekstowe, zapis do pamięci; „Słuchaj inżyniera” w przeglądarce. `[PRODUCT]` `index.html:548–560`, `2392`
- Grafik i plan: kilka aut zespołu w jednym wyścigu, dane wyścigu, dostępność kierowców w godzinach, automatyczne rozpisanie stintów (kierowcy, podwójne stinty, strategia opon, noc), ręczna edycja, wklejenie planu z arkusza Google; grafik na żywo przelicza się z prawdziwego tempa. `[PRODUCT]` `index.html:582–660`
- Zespół: kod zespołu z QR, link dla obserwatorów, klucz Groq zespołu, lista kierowców z tematami powiadomień ntfy i testem powiadomienia, zmiana hasła przez założyciela, przełączanie zespołów na urządzeniu. `[PRODUCT]` `index.html:663–705`, `2248–2365`
- Okrążenia: podsumowanie sesji per kierowca i stint (najlepsze, średnie, konsystencja, paliwo, energia), mapa porównania okrążeń z wykresem prędkości, gazu i hamulca oraz linkiem do porównania, tabela okrążeń z filtrem „tylko czyste” i eksportem CSV. `[PRODUCT]` `index.html:707–760`, `2441–3504`
- Pamięć: notatki zespołu (opcjonalnie per tor), które AI inżyniera bierze pod uwagę. `[PRODUCT]` `index.html:810–812`
- Pomoc: pierwsze kroki, konfiguracja powiadomień, grafik, formularz „Zgłoś problem albo sugestię”, linki do instrukcji i „Co nowego”. `[PRODUCT]` `index.html:764–808`
- Języki: PL, EN, DE, FR, ES, IT, DA; jasny i ciemny motyw; jednostki metryczne lub imperialne per oglądający. `[PRODUCT]` `index.html:405–406`, `933–936`, `i18n.js`
- Usługi zewnętrzne używane przez stronę: Firebase (baza i logowanie), ntfy.sh (test powiadomień), serwer aktualizacji autora (powiadomienie o zgłoszeniu), Google Fonts. `[PRODUCT]` `index.html:8–13`, `2355`, `3667`
- What makes it different: deferred — porównanie z innymi narzędziami nie jest potrzebne do opisu stanu istniejącego.

| reference | what it does well | where it falls short for our users | checked on | link |
|---|---|---|---|---|

## Goals and success criteria

- Business goal: deferred — sesja dotyczyła opisu stanu, nie celów.
- User outcome: deferred — brak materiału o oczekiwaniach użytkowników.
- Primary metric, baseline today, threshold, date: deferred; baseline liczby użytkowników jest do zebrania (*Collection plan*).
- What must not get worse: dostęp do danych zespołu tylko dla zespołu i założyciela oraz publiczny tylko podgląd (R01, R04).

## Scope

- **Now:** opis istniejącej ściany boksów z tego repozytorium (D01).
- **Later:** wolne przerysowanie po zmianie rozmiaru (D02, Q01); opis programu na komputer, jeśli właściciel zdecyduje inaczej niż w D01.
- **Not doing:** see Non-goals

## Domain glossary

| Term | Meaning | Owned by | Visible to |
|---|---|---|---|
| Kod zespołu | 6-znakowy losowy kod; z hasłem zespołu wpuszcza na stronę i do programu | zespół | członkowie zespołu (zakładka Zespół, QR) |
| Hasło zespołu / hasło założyciela | dwa różne hasła (min. 6 znaków); założyciel ma dodatkowe uprawnienia | założyciel | kto je dostanie |
| Założyciel | osoba, która utworzyła zespół; zarządza listą kierowców, ustawieniami i hasłem zespołu | — | zespół |
| Link dla obserwatorów | publiczny link tylko do podglądu na żywo, bez radia, planu i hasła | zespół | każdy z linkiem |
| Stint / grafik | odcinek jazdy jednego kierowcy między pitstopami / ich rozkład w czasie | zespół | zespół |
| Auto | osobny wyścig, plan i grafik w zespole wystawiającym kilka aut | zespół | zespół |
| Czyste okrążenie | bez alei, safety cara, nieważnych i wolniejszych o ponad 7% od najlepszego | — | zespół |
| Pamięć zespołu | notatki brane pod uwagę przez AI inżyniera | zespół | zespół |
| Temat ntfy | prywatny temat powiadomień kierowcy w aplikacji ntfy | kierowca | kierowca |

Źródło terminów: `[PRODUCT]` `index.html` (sekcje opisane w *Product*; czyste okrążenie `index.html:707–720`, kod zespołu `index.html:1497–1520`).

## Key flows

- Utworzenie zespołu: nazwa, hasło zespołu i inne hasło założyciela → strona losuje kod, tworzy link obserwatora i domyślne ustawienia (24 h, powiadomienie 30 min) → konto założyciela → zakładka Zespół. `[PRODUCT]` `index.html:1497–1520`, `2249–2262`
- Dołączenie: kod + hasło zespołu (na telefonie skan QR); strona pamięta logowanie i zespoły na urządzeniu. `[PRODUCT]` `index.html:422–450`, `764–772`
- Przed wyścigiem (jedna osoba): kierowcy w zakładce Zespół → dane wyścigu → rozpisanie planu → poprawki → zapis. `[PRODUCT]` `index.html:785–793`
- Powiadomienia (każdy kierowca, raz): aplikacja ntfy → temat ze strony → subskrypcja → test; powiadomienie ok. 30 min przed zmianą, ponownie przy przesunięciu o ≥10 min, oraz gdy zacznie padać. `[PRODUCT]` `index.html:774–783`
- W wyścigu: każdy członek ma włączony program; strona pokazuje dane na żywo, grafik przelicza się z tempa, zespół pisze do kierowcy przez radio. `[PRODUCT]` `index.html:764–772`, `561–566`
- Po wyścigu: podsumowanie sesji, porównanie okrążeń, eksport CSV. `[PRODUCT]` `index.html:707–760`
- Future state: deferred — brak decyzji o zmianach.

## Business rules

Reguły wynikają z `database.rules.json` i kodu; obowiązują w produkcie, ale właściciel nie potwierdził jeszcze, że są zamierzone.

| Id | Rule | Applies to | Source | Status | Review by | Required path to change | Owner | Supersedes |
|---|---|---|---|---|---|---|---|---|
| R01 | Dane zespołu czyta tylko konto zespołu albo konto założyciela — zgodne z uid we wpisie `owner`, a gdy wpis nie ma uid (starsze zespoły), dowolne konto `<kod>.owner`; zapis ustawień i wpisu założyciela regulują R02–R03. | `teams/<kod>` | `[PRODUCT]` `database.rules.json` | proposal | unknown | Maciej Szczepaniak | Maciej Szczepaniak | none |
| R02 | Członek zespołu zmienia ustawienia oprócz listy kierowców; wpis założyciela może utworzyć konto zespołu tylko, gdy go jeszcze nie ma, a potem zmienia go tylko założyciel. | `teams/<kod>/settings`, `owner` | `[PRODUCT]` `database.rules.json` | proposal | unknown | Maciej Szczepaniak | Maciej Szczepaniak | none |
| R03 | Gdy zespół ma założyciela, listę kierowców zmienia założyciel; członek może tylko dopisać nowego kierowcę. | `settings/drivers` | `[PRODUCT]` `database.rules.json` | proposal | unknown | Maciej Szczepaniak | Maciej Szczepaniak | none |
| R04 | Link obserwatora daje publiczny odczyt podglądu na żywo, listy aut, torów i grafiku, bez radia i planu; ten sam token udostępnia też jednorazowy klucz logowania „Otwórz pit wall” z programu (`pw/<id>`), kasowany po zalogowaniu. | `obs/<token>` | `[PRODUCT]` `database.rules.json`, `index.html:568–571`, `1233–1240`, `1450–1453` | proposal | unknown | Maciej Szczepaniak | Maciej Szczepaniak | none |
| R05 | Zgłoszenie może wysłać każdy, także bez logowania, jako jednorazowy zapis (tekst 5–3000 znaków, dziennik do 20 000, inne pola tekstowe do 200); czyta je tylko konto administratora. | `feedback` | `[PRODUCT]` `database.rules.json` | proposal | unknown | Maciej Szczepaniak | Maciej Szczepaniak | none |
| R06 | Hasło założyciela musi różnić się od hasła zespołu; oba mają co najmniej 6 znaków. | tworzenie zespołu | `[PRODUCT]` `index.html:1499–1500` | proposal | unknown | Maciej Szczepaniak | Maciej Szczepaniak | none |

## Non-goals

| Id | We are not building | Why | Owner | Status | Review by | Required path to change | Source | Supersedes |
|---|---|---|---|---|---|---|---|---|
| N01 | Brief nie opisuje programu na komputer (inżynier głosowy, raporty, mikrofon, AI, licencje). | Jego kodu nie ma w tym repozytorium; zakres wybrany w D01. | Maciej Szczepaniak | proposal | gdy powstanie brief programu | Maciej Szczepaniak | `[DOCUMENT]` D01 | none |

## Decisions

| Id | Date | Decision | Why | Owner | Status | Review by | Required path to change | Source | Supersedes |
|---|---|---|---|---|---|---|---|---|---|
| D01 | 2026-11-14 | Brief charakteryzuje projekt i dokumentuje tylko ścianę boksów z tego repozytorium. | Cel sesji: opis tego, co istnieje. Agent proponował też opis programu na podstawie instrukcji; prowadzący sesję wybrał węższy zakres. | Maciej Szczepaniak (zaproponował zewnętrzny kontrybutor; Q03) | proposal | unknown | Maciej Szczepaniak | `[DOCUMENT]` `.ai/specs/research/decisions/D01-zakres-briefu.md` | none |
| D02 | 2026-11-14 | Problem wolnego przerysowania po zmianie rozmiaru okna odłożony na później. | „Pomiń to na razie” — bez dalszego opisu. | Maciej Szczepaniak (zaproponował zewnętrzny kontrybutor; Q03) | proposal | przy wyborze kolejnych prac | Maciej Szczepaniak | `[DOCUMENT]` `.ai/specs/research/decisions/D02-odroczenie-resize.md` | none |

## Riskiest assumptions

| Id | Assumption | Importance | Evidence today | If false | Smallest test | Owner | By when | Result |
|---|---|---|---|---|---|---|---|---|
| A01 | Ze strony korzysta kilkadziesiąt osób i działa im. `[ASSUMPTION]` szacunek prowadzącego sesję | medium | brak pomiaru; autor ma licznik instalacji i zgłoszenia (`prywatnosc.html`) | opis grupy docelowej i priorytety przyszłych prac byłyby oparte na złej skali | odczyt licznika instalacji (tryb zespół) i liczby zespołów w bazie za ostatnie 3 miesiące | Maciej Szczepaniak | unknown | untested |

## Kill criteria

Nie dotyczy: sesja opisuje istniejący produkt, nie decyduje o jego kontynuacji.

## Hypotheses to test

Brak.

## Open questions

| Id | Question | Blocking | Who can answer | Status |
|---|---|---|---|---|
| Q01 | Gdzie i jak objawia się wolne przerysowanie po zmianie rozmiaru (przeglądarka czy program, która zakładka, jak długo)? W kodzie strony zmianę rozmiaru obsługują: dopasowanie napisu pitstopu przy każdym zdarzeniu (`index.html:926`), przebudowa mapy toru po przekroczeniu 640 px (`index.html:3648`) i przerysowanie etykiet mapy porównania (`index.html:3091`) — niezweryfikowane jako przyczyna. | nie (odłożone, D02) | prowadzący sesję / Maciej Szczepaniak | open |
| Q02 | Czy reguły R01–R06 są zamierzonym zachowaniem produktu? Do rozważenia przy tym: członek zespołu bez wpisu założyciela może zostać założycielem (R02), zgłoszenia przyjmowane bez logowania (R05), klucz logowania czytelny dla każdego z tokenem i id (R04). | tak — blokuje traktowanie ich jako chronionego kontraktu w przeglądach kodu | Maciej Szczepaniak | open |
| Q03 | Czy właściciel przyjmuje D01–D02 i N01? Prowadzący sesję to zewnętrzny kontrybutor, który nie decyduje w imieniu właściciela (odpowiedź z 2026-11-14). | nie dla opisu; tak dla traktowania D01–D02 i N01 jako obowiązujących | Maciej Szczepaniak | open |

## Definition of Ready addendum (existing)

Problems i Target group nie mają wsparcia w danych ani wywiadach — tylko w opisie produktu i szacunku (A01). Brief nadaje się jako opis stanu istniejącego; nie jest gotowy do planowania nowych funkcji ani backlogu. Zmiany dotykające R01–R06 wymagają decyzji właściciela (Q02).

## Collection plan

### Ile osób i zespołów faktycznie korzysta ze ściany boksów?

- What decision or work needs it: opis grupy docelowej (A01) i przyszły wybór prac
- Who can answer it: autor (dostęp do serwera aktualizacji i konsoli Firebase)
- How: odczyt licznika instalacji (tryb solo/zespół, ostatnie 3 miesiące) i liczby zespołów w `teams` z aktywnością w tym okresie
- Owner and by when: unknown
- Template: `.ai/specs/research/templates/data-request.md`

### Na co skarżą się i o co proszą użytkownicy?

- What decision or work needs it: sekcja Problems; przyszły wybór prac
- Who can answer it: autor (konto administratora zgłoszeń)
- How: eksport węzła `feedback` lub kopii zgłoszeń z prywatnego repozytorium, bez danych kontaktowych
- Owner and by when: unknown
- Template: `.ai/specs/research/templates/data-request.md`
