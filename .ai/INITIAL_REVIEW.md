# Initial code review — Pit Wall Crew

## Verdict: **request changes**

**Potwierdzono stored XSS oraz 12 problemów klasy major.** Najważniejsze ryzyka dotyczą renderowania danych Firebase, modelu wspólnego konta zespołu, przypisywania kierowców do aut oraz utraty/spójności planów. Dodatkowo opisano 11 ustaleń minor i 5 ryzyk wymagających sprawdzenia warunków wdrożenia. Nie stwierdzono ani nie testowano naruszenia działającej produkcji.

To przegląd całego projektu, nie konkretnego PR. Werdykt ocenia stan aplikacji; nie oznacza, że wszystkie problemy wprowadzono ostatnim commitem.

## Zakres i metoda

- Data: **2026-11-14**. Rewizja: `2f24b2ac1466b8a5dbf4bd01ff4c76b44f8f5f9f`.
- Przed analizą przeczytano [product brief](specs/product-brief.md). Reguły R01–R06 i decyzje D/N są tam **propozycjami**, a Q02/Q03 wykluczają traktowanie ich jako zatwierdzonego kontraktu. Nie podnoszono kategorii znalezisk za sprzeczność z tymi propozycjami.
- Trzy niezależne analizy: **Kimi K3 (`kimi-k3`)**, **Gemini 4 Hydrogen (`gemini-4-hydrogen`)** i analiza główna **GPT-6.1 Sol (`gpt-6.1-sol`)**. Następnie osobny subagent **GPT-6.1 Sol** zweryfikował wszystkie kandydatury i ich podtezy na podstawie kodu, odrzucając duplikaty oraz fałszywe alarmy.
- Analizowano `index.html`, `database.rules.json`, `i18n_core.js`, strukturę słowników `i18n.js`, README, instrukcje, prywatność i changelog. Słowników nie poddano pełnej korekcie językowej. Grafiki sprawdzono pod kątem odwołań, nie zawartości wizualnej. Narzędzia agentowe `.agents/`, `.claude/` i kod nieobecnej aplikacji desktopowej nie są przedmiotem review.
- Nie zmieniano kodu aplikacji, nie instalowano zależności, nie wysyłano żądań do produkcji i nie wykonywano aktywnych prób wykorzystania podatności. Powstał wyłącznie ten raport oraz pomocnicze artefakty sesji.

**Oznaczenia dowodów:** **kod** — potwierdzony przepływ w źródłach; **repro offline** — wyodrębnione rzeczywiste funkcje wykonane w Node VM ze stubami, nie przeglądarka/emulator; **warunkowe** — potrzebny dodatkowy, nieweryfikowany stan wdrożenia.

Identyfikatory **CR-xx** poniżej odnoszą się do review, nie do reguł Rxx z briefu.

## Blocker

### CR-01 — Stored XSS w widoku zespołu i obserwatora

**Miejsca:** `index.html:994`, `1046`, `1100–1108`, `1183–1186`, `1738–1742`, `2750`, `2953`, `2977–2979`, `3020–3027`, `3164`, `3282`, `3634–3637`; dodatkowo `883`, `888–894`. Granica zapisu: `database.rules.json:5–7`, `45–60`.

Dane z bazy trafiają bez escapowania do HTML/SVG: m.in. `st.penalties`, liczba/opis postojów opon rywala, `grafik.rows[].n/laps`, liczba okrążeń fair share, numer okrążenia i `stop_in` uszkodzenia, nazwy zakrętów z `cr[][3]` oraz pozycja auta `c[2]`. `setH()` ostatecznie przypisuje `innerHTML`, a reguły nie wymagają liczbowego typu tych pól. Zwykła telemetria liczbowa nie stanowi zabezpieczenia przed innym klientem bazy.

Nieuczciwy członek może zatruć dane własnego zespołu. Istnieje też ścieżka własnego publicznego podglądu: dostarczone źródła wspierają rejestrację konta i utworzenie własnego tokenu obserwatora. Ofiara otwierająca taki link nie musi znać hasła ani należeć do zespołu atakującego. Rzeczywiste ograniczenia rejestracji produkcyjnej nie były sprawdzane.

**Skutek:** wykonanie aktywnej zawartości w originie aplikacji i dostęp do danych/operacji dostępnych tam zalogowanej ofierze. Nie zakładamy konkretnego magazynu tokenów Firebase ani nie twierdzimy, że wykradziono tokeny.

**Naprawa:** `textContent`/bezpieczne węzły tekstowe albo escapowanie właściwe dla kontekstu we wszystkich sinkach; ścisłe typy i zakresy telemetrii w regułach bazy. Objąć poprawką również podgląd publiczny.

**Test:** każdy wskazany renderer otrzymuje nieaktywne znaczniki testowe jako wartości pól; wynik ma być tekstem, nie nowym elementem DOM. Testy reguł odrzucają niepoprawne typy. **Dowód: kod + repro offline.**

## Major

### CR-02 — Członek nie może zapisać kierowcy, którego UI pozwala dodać

**Miejsca:** `index.html:2333–2339`, `2373–2378`, `2421–2424`; `database.rules.json:7`, `32`, `35–37`.

Gdy zespół ma założyciela, członek może według reguły utworzyć nieistniejący element `drivers/$i`. Przycisk zapisuje jednak całe `settings/drivers` przez `set(readDrivers())`. Zgoda na zapis potomka **nie uprawnia do zastąpienia rodzica**; zapis jest odrzucany. Edycja istniejących tematów ntfy jest również oferowana mimo braku odpowiedniego uprawnienia.

**Naprawa:** zapisywać dozwolone nowe elementy pod stabilnymi kluczami, z ochroną przed kolizją; zastępowanie/usuwanie pozostawić założycielowi. Tematy istniejących kierowców zablokować w UI albo świadomie nadać wąskie uprawnienie do ich zmiany.

**Test:** emulator: append członka dozwolony, parent-set i zmiana/usunięcie istniejącego kierowcy zabronione, edycja założyciela dozwolona; test UI udanego appendu. **Dowód: kod i semantyka reguł; emulator nieuruchomiony.**

### CR-03 — Odświeżenie okrążeń nie unieważnia cache porównania

**Miejsca:** `index.html:2429–2432`, `2445`, `2453–2455`, `2460–2462`, `2495`.

`cmpLoad()` zastępuje indeksy, lecz nie zmienia `CMP.ver` ani nie czyści `_lc`. Dla tego samego toru `cmpList()` zwraca poprzednią listę. Nowe lub lepsze okrążenie nie pojawia się mimo odświeżenia; przejście przez inne tory może przypadkiem usunąć objaw.

**Naprawa:** unieważniać cache razem z udanym zastąpieniem indeksów.

**Test:** załadować okrążenie 100 s, podmienić indeks na 90 s, wykonać odświeżenie; lista/picker muszą pokazać 90 s. **Dowód: kod + repro offline.**

### CR-04 — Filtr sesji miesza okrążenia różnych aut

**Miejsca:** `index.html:3293–3305`, `3307–3315`; poprawniejszy wzorzec per auto: `3424–3433`.

`lapSessions()` ma jeden kursor `cur`. Przy przeplatanych okrążeniach A1, B1, A2, B2 potrafi rozciąć sesję A i połączyć B1 z A2 poprzez heurystykę kolejnych numerów okrążeń. Dotyczy to grupowania filtra; nie wszystkie podsumowania korzystają z tego samego błędnego kursora.

**Naprawa:** kursory per auto oraz jawne zasady ciągłości sesji, rodzaju sesji i przerw. Heurystykę kompatybilności starszych zapisów stosować tylko w obrębie tego samego auta.

**Test:** A1/A2 w jednej sesji, B1/B2 w drugiej, niezależnie od przeplatania; dodatkowo rzeczywista zmiana sesji i starsze identyfikatory. **Dowód: kod + repro offline.**

### CR-05 — Ponowne logowanie do tego samego zespołu nie odtwarza widoku

**Miejsca:** `index.html:1479–1489`, `1524–1538`; zwykłe wylogowanie z reloadem: `2328`.

Po rozpoczęciu przełączania zespołu `showLogin()` ukrywa zakładki/widoki. Jeżeli użytkownik wróci do pierwotnego konta, `startTeam()` rozpoznaje ten sam `STARTED` i wraca po aktualizacji uprawnień, bez odtworzenia widoku. Użytkownik pozostaje na ekranie logowania mimo udanego uwierzytelnienia.

**Naprawa:** oddzielić inicjalizację subskrypcji od odtwarzania UI; tę drugą wykonywać przy każdym poprawnym wejściu. Nie dublować listenerów.

**Test:** wejście do A → ekran logowania → ponowne logowanie do A; zakładki i właściwy widok wracają, liczba subskrypcji się nie zwiększa. **Dowód: kod + repro offline.**

### CR-06 — Błąd lub brak pierwszego odczytu toru blokuje ponowienie mapy

**Miejsca:** `index.html:3536–3551`.

Klucz mapy jest ustawiany przed wynikiem odczytu. Po odrzuceniu żądania albo otrzymaniu pustego rekordu kolejne próbki z tym samym kluczem w trybie zespołu nie uruchamiają odczytu ponownie. Odrzucenie nie jest obsłużone. Mapa może pozostać ukryta mimo późniejszej dostępności danych.

**Naprawa:** rozdzielić klucz żądany od poprawnie załadowanego; obsłużyć błąd/pusty wynik, zwalniać stan oczekiwania i umożliwić ograniczone ponowienie.

**Test:** pierwszy odczyt A odrzucony lub pusty, następny poprawny; ten sam tor odzyskuje mapę bez przeładowania i nieobsłużonego odrzucenia. **Dowód: kod + repro offline dla błędu/braku retry.**

### CR-07 — Spóźniona odpowiedź toru nadpisuje aktualną mapę

**Miejsca:** `index.html:3540–3546`, `3553–3558`.

Żądanie A → przełączenie na B → odpowiedź B → odpowiedź A powoduje zainstalowanie geometrii A przy aktywnej telemetrii B. Nie ma sprawdzenia, czy odpowiedź nadal odpowiada aktualnemu kluczowi.

**Naprawa:** sprawdzać przechwycony klucz/generację żądania przed zastosowaniem wyniku.

**Test:** kontrolowane odpowiedzi B→A zachowują geometrię B; stary błąd A nie resetuje stanu B. **Dowód: kod + repro offline.**

### CR-08 — Wspólne konto Auth nie pozwala wymusić „hasło zmienia tylko założyciel”

**Miejsca:** `index.html:2266`, `2272`, `2275–2279`, `2293–2303`; obietnica również w `instrukcja.html:289`.

Zmiana hasła w UI założyciela polega na zalogowaniu pomocniczego połączenia jako **zwykłe konto zespołu** i wywołaniu `user.updatePassword()`. Każdy członek znający te same poświadczenia może po świeżym uwierzytelnieniu wykonać operację Auth bez tożsamości założyciela. Ukrycie formularza nie stanowi autoryzacji.

**Skutek:** członek może odebrać pozostałym możliwość kolejnych logowań; formularz założyciela również potrzebuje dotychczasowego hasła zespołu. Nie twierdzimy, że wszystkie istniejące sesje natychmiast wygasną.

**Naprawa:** uzgodnić rzeczywisty model zaufania. Dla kontroli wyłącznie założyciela potrzebne są indywidualne tożsamości/członkostwa i zaufana operacja administracyjna, bez udostępniania wszystkim poświadczeń zarządzalnego konta Auth. Sam proxy lub reguła RTDB tego nie naprawią. Alternatywa to jawne uznanie, że każdy posiadacz wspólnego hasła kontroluje to konto.

**Test:** integracja Auth/backend: członek nie zmienia poświadczenia dostępu z pominięciem roli, założyciel może, odzyskiwanie działa. **Dowód: kod i model kontroli konta Firebase Auth; bez wywołań produkcyjnych.**

### CR-09 — „Czas polski” jest interpretowany w strefie przeglądarki

**Miejsca:** `index.html:1795–1796`, `1809–1812`, `1835–1840`, `1873–1876`.

Etykieta deklaruje czas polski, ale `datetime-local`, `new Date(raw)` i `dtLocal()` używają lokalnej strefy użytkownika. Identyczna wpisana godzina daje różne momenty startu. `isNight()` również korzysta z lokalnego `getHours()`, więc wspólne ustawienia nocy mogą dawać różne klasyfikacje strategiczne.

**Naprawa:** wskazać strefę wyścigu/nocy i stosować ją konsekwentnie: np. `Europe/Warsaw` z DST albo prawidłowo opisać czas lokalny i zdefiniować wspólną podstawę strategii. Dane **już są** epoch milliseconds — samo „zapisywanie UTC” nie naprawia interpretacji. Dostępność kierowców celowo pokazuje lokalne godziny i tego nie należy przypadkiem zmieniać.

**Test:** ten sam zamierzony start w Warszawie/UTC/Nowym Jorku daje ten sam moment; lato/zima, przejścia DST i spójna klasyfikacja nocy. **Dowód: kod + repro offline rozbieżności o godzinę w listopadzie.**

### CR-10 — Pełny zapis planu bez wersjonowania gubi równoległe zmiany

**Miejsca:** `index.html:1539–1541`, `1978–1987`, `2019–2024`, `2030`, `2047–2052`, `2223–2225`.

Brudny edytor celowo nie odświeża się po zmianie z bazy. Dwie osoby edytujące ten sam stan zapisują pełny plan przez `set()`; drugi zapis nadpisuje pierwszy. Zachowane w DOM `data-keep` może także przywrócić starsze `lapsActual` po aktualizacji przez producenta danych. Instrukcja sugeruje planowanie przez jedną osobę, co ogranicza ryzyko, ale kod nie wymusza tej wyłączności.

**Naprawa:** transakcja ze sprawdzeniem rewizji i komunikatem konfliktu albo konfliktowo bezpieczne zmiany per rekord; oddzielić postęp aktualizowany przez producenta od pól edytora.

**Test:** dwóch edytorów tej samej rewizji nie traci zmian bez ostrzeżenia; aktualizacja `lapsActual` między odczytem i zapisem nie jest cofana. **Dowód: kod; bez wieloklientowego testu Firebase.**

### CR-11 — Zakończenie starego zapisu usuwa flagę nowszych zmian

**Miejsca:** `index.html:1247`, `1264`, `1848–1851`, `2035–2037`, `2223–2225`.

Zapis A trwa, użytkownik przełącza się na B i edytuje B, po czym odpowiedź A ustawia globalne `PLAN_DIRTY = false`. Ten sam problem występuje przy nowszych zmianach tego samego auta wykonanych podczas zapisu. Kolejne przełączenie lub render może utracić niezapisane zmiany bez oczekiwanego ostrzeżenia.

**Naprawa:** przechwycić identyfikator auta i rewizję edytora; czyścić wyłącznie odpowiadający im niezmieniony stan albo prowadzić dirty/pending per auto i rewizję.

**Test:** opóźniony zapis A nie czyści dirty B ani nowszej edycji A. **Dowód: kod + repro offline.**

### CR-12 — Niepoprawne liczby uruchamiają nieograniczoną pracę planera

**Miejsca:** `index.html:618`, `1302–1316`, `1347`, `1837–1845`, `1918–1937`, `1983–1985`, `2055–2069`.

`parseFloat` przyjmuje końcowe śmieci oraz wartości nieskończone; guardy generatora sprawdzają głównie truthiness, nie dodatniość, całkowitość i zakres. Dla `laps=-1`, czasu okrążenia 60 s i postoju 60 s mianownik liczby stintów wynosi zero: dodatnia długość wyścigu daje `n=Infinity`, a następnie nieograniczoną pętlę. Wystarczą błędne dane użytkownika, nie atakujący. Duża liczba godzin/stintów powiększa też tabelę dostępności i koszt optymalizacji.

**Naprawa:** ścisłe parsowanie skończonych wartości; zakresy domenowe przed zapisem i generowaniem; limit obliczonej liczby stintów, kolumn dostępności i rozmiaru wejścia optymalizatora.

**Test:** odrzucić śmieci, Infinity, ujemne/zerowe i ułamkowe liczby okrążeń oraz nadmierny wynik **przed pętlą**; sprawdzić poprawne wartości graniczne. **Dowód: kod + bezpieczne repro arytmetyki; zawieszającej pętli nie uruchamiano.** Firebase odrzuca niefinitywne liczby — nie twierdzimy, że Infinity zapisze się w RTDB.

### CR-15 — Dopasowanie po imieniu wygrywa z dokładnym kierowcą i autem

**Miejsca:** `index.html:1248–1253`, `1604–1615`, `1696–1704`, `2061–2062`, `2234–2235`.

Dla listy „Jan Kowalski, Jan Nowak” wyszukanie pełnego „Jan Nowak” zwraca pierwszego Jana. `carOf()` wywołuje fuzzy matching osobno dla każdego auta i może wybrać grafik niewłaściwego samochodu. Sama zmiana priorytetu wewnątrz pojedynczego `ktoMatch()` nie wystarczy do poprawienia `carOf()`.

**Naprawa:** stabilne ID kierowców i jawne członkostwo auta; w kompatybilności najpierw globalne dopasowanie dokładne, skrót tylko gdy jest jednoznaczny.

**Test:** dwa identyczne imiona w różnych autach, dowolna kolejność rekordów, dokładne pełne nazwisko oraz niejednoznaczny skrót; nigdy arbitralne pierwsze dopasowanie. **Dowód: kod + repro offline.**

## Minor — odporność, dostępność i utrzymanie

### CR-13 — Tekstowy czas sektora przerywa render

**Miejsca:** `index.html:841–846`, `1034–1036`.

Wartość `"30.123"` przechodzi porównania, ale nie ma metody `toFixed()`. Powstaje wyjątek, mimo że dane liczbowe działają. Nie wykazano, że obecny producent regularnie wysyła taki format.

**Naprawa/test:** normalizacja i walidacja skończonych liczb na granicy; błędne pole daje jawny stan zastępczy, nie przerywa dashboardu. Test liczby, tekstu liczbowego i niepoprawnych typów. **Dowód: kod + repro offline.**

### CR-14 — Pusta lista fair share powoduje wyjątek

**Miejsca:** `index.html:1174–1188`.

`rows: []` jest truthy, więc kod odczytuje `rows[0].need_end`. Render przerywa się dla takiej próbki; późniejsza poprawna próbka może go naprawić bez reloadu.

**Naprawa/test:** sprawdzenie typu i długości listy, jawny empty state; test brak/pusta/poprawna lista oraz przejścia między nimi. **Dowód: kod + repro offline rzeczywistego `render()`.**

### CR-16 — Normalizowane nazwiska kolidują w dostępności

**Miejsca:** `index.html:1270–1274`, `1310–1315`, `1325–1327`, `2125–2128`.

`wearKey()` daje ten sam klucz np. dla `Łukasz`/`Lukasz` albo `A B`/`A.B`. Dostępność odrębnych kierowców zostaje połączona i wpływa na przydział.

**Naprawa/test:** stabilne ID z migracją istniejących kluczy lub co najmniej jawne odrzucanie kolizji; dwie kolidujące nazwy muszą zachować niezależną dostępność. **Dowód: kod + repro offline.**

### CR-17 — CSV nie neutralizuje formuł arkusza

**Miejsca:** `index.html:3494–3501`; zapis okrążeń: `database.rules.json:15–16`.

Poprawne podwajanie cudzysłowów chroni strukturę CSV, nie interpretację tekstów `who/veh/compound/notes` jako formuł. Skutek wymaga eksportu i otwarcia w arkuszu interpretującym takie wartości; nie demonstrowano wykonania kodu ani połączeń zewnętrznych.

**Naprawa/test:** przyjąć politykę eksportowania niezaufanych tekstów jako literalnego tekstu arkusza; przetestować nieaktywny przykład `=1+1`, prefiksy kontrolne, spacje i separatory, zachowując poprawne liczby. **Dowód: kod; docelowych arkuszy nie uruchamiano.**

### CR-18 — Wypełnionego slotu porównania nie otwiera klawiatura

**Miejsca:** `index.html:2572`, `2577–2585`.

Wypełniony slot to `div role="button" tabindex="0"` z samym `onclick`; Enter/Spacja nie wykonują akcji, w przeciwieństwie do pustych slotów będących przyciskami.

**Naprawa/test:** natywny przycisk głównej akcji i osobny pin albo pełna obsługa klawiatury; test Enter/Spacji, focusu i niezależnej obsługi pinu. Unikać zagnieżdżonych przycisków. **Dowód: kod; bez testu przeglądarkowego.**

### CR-19 — Eksport nie zwalnia adresów Blob

**Miejsca:** `index.html:3499–3501`.

Każdy eksport tworzy object URL bez `revokeObjectURL()`. W długo otwartej karcie wielokrotne eksporty zatrzymują niepotrzebne zasoby; nie jest to dowód katastrofalnego wycieku pamięci.

**Naprawa/test:** zwolnić URL po bezpiecznym rozpoczęciu pobrania; test wielu eksportów i zwolnienia każdego utworzonego URL przy zachowaniu poprawnych plików. **Dowód: kod.**

### CR-20 — Subskrypcje porzuconych przebiegów nie mają cyklu życia

**Miejsca:** `index.html:2664–2686`, `2696–2703`.

Listener `cmpGetLap()` odłącza się dopiero po otrzymaniu `z`; brak danych, odpowiedź `missing` i zmiana wyboru mogą pozostawić go do zamknięcia strony. `CMP.req[id]` blokuje ponowne zakolejkowanie. **Nie oznacza to, że późniejszy wynik nie zadziała** — pozostawiony listener celowo może obsłużyć spóźnioną odpowiedź desktopu.

**Naprawa/test:** jawna własność subskrypcji i requestu; zachować oczekiwanie aktywnego wyboru na uruchomienie desktopu, sprzątać porzucone/końcowe żądania, umożliwić kontrolowane retry. Test późnego wyniku po `off`, zmiany toru, `missing` i braku duplikacji listenerów. **Dowód: kod.**

### CR-21 — Pełne kolekcje rosną razem z kosztem widoku

**Miejsca:** `index.html:1543–1559`, `2452–2454`, `3508–3519`; poprawny limit tabeli okrążeń: `2432`.

Pełne `cars`, `memory` oraz indeksy `tlapsi/ltracei/ltsess` są pobierane/subskrybowane bez ograniczenia do aktualnego widoku. Wzrost danych oznacza większe transfery i sortowanie. Retencji wymuszanej przez desktop nie sprawdzono; nie udowodniono nieograniczonego historycznie wzrostu ani zmierzonego spowolnienia.

**Naprawa/test:** pomiar realistycznych danych, ograniczenie do wybranego auta/toru, paginacja i odpowiednie okna indeksów. Test budżetu rekordów/bajtów dla wielu torów i aut, z dostępem do starszych danych. **Dowód: kod; zalecenie skalowalności.**

### CR-22 — Skrypty CDN bez kontroli integralności

**Miejsca:** `index.html:11–14`.

Wersje bibliotek są przypięte, ale nie mają SRI. Zmiana odpowiedzi z CDN nie byłaby wykryta przez przeglądarkę. Nie wskazano potwierdzonego CVE, skompromitowanej biblioteki ani dostawcy.

**Naprawa/test:** hostowane lokalnie przypięte artefakty albo zweryfikowane hashe `integrity` z właściwym `crossorigin` i procedurą aktualizacji; test poprawnego oraz zmienionego zasobu w przeglądarce. CSP ocenić na rzeczywistym wdrożeniu — brak meta-CSP nie dowodzi braku nagłówka HTTP. **Dowód: kod; hardening.**

### CR-23 — Zgłoszenie może zawierać wiele nieznanych pól

**Miejsca:** `database.rules.json:65–80`; kształt zgłoszenia webowego: `index.html:3660–3662`.

`$other` ogranicza pojedynczą wartość, lecz akceptuje dowolną liczbę dodatkowych pól skalarnych w granicach limitu żądania Firebase. To powiększa zapis i przetwarzanie poza zamierzony rekord.

**Naprawa/test:** allowlista rzeczywistych pól i typów albo jawny limit liczby dzieci, po zinwentaryzowaniu pól desktopu, w tym opcjonalnego `log`. Emulator ma akceptować znane zgłoszenia web/desktop i odrzucać obce pola oraz przekroczone limity. **Dowód: kod; bez emulatora i testów obciążenia.**

### CR-24 — Brak powtarzalnej, śledzonej bramki regresji aplikacji i reguł

**Miejsca:** `README.md:1–5`, `index.html:824–3679`, `database.rules.json:1–84`; inwentarz `git ls-files`.

W sprawdzanym repozytorium nie znaleziono testów aplikacji/reguł, manifestu runnera, konfiguracji lintowania ani workflow CI. Nie oznacza to, że infrastruktura autora nie wykonuje żadnych zewnętrznych kontroli. Tymczasowe skrypty tej sesji nie są istniejącym zestawem testów produktu.

**Naprawa/test:** mały, udokumentowany zestaw Node dla domeny i asynchroniczności, testy reguł/Auth w emulatorze i powtarzalna komenda CI. Zacząć od przypadków wymienionych w tym raporcie. Nie ma potrzeby przepisywania statycznej aplikacji na framework. **Dowód: inwentarz repozytorium.**

## Ryzyka warunkowe — niepotwierdzony stan produkcji

### CR-25 — Legacy owner bez UID: przejęcie, jeśli konto e-mail jest dostępne

**Waga:** blocker **wyłącznie przy spełnieniu warunków**. **Miejsca:** `database.rules.json:5`, `7`, `28`, `32`, `35`; `index.html:2253–2259`.

Potrzebne są łącznie: wdrożone te reguły, wpis `owner` bez `uid`, dostępna do zarejestrowania tożsamość `<kod>.owner`, możliwość rejestracji i znajomość kodu. Wtedy matching email spełnia fallback i umożliwia odczyt/zapis zespołu. Nie sprawdzono, czy istnieje choć jeden taki zespół/konto.

**Działanie:** operator weryfikuje warunki, przeprowadza zaufaną migrację właścicieli do UID i usuwa fallback. Nowo zarejestrowany pasujący e-mail nie może sam nadać sobie prawa do migracji.

**Test:** legacy UID-less + obca pasująca tożsamość odrzucone; prawidłowo migrowany założyciel działa; usunięcie/odtworzenie e-maila nie dziedziczy UID-bound uprawnień.

### CR-26 — Rezerwacja e-maila założyciela może zablokować jego ustanowienie

**Waga:** major przy dostępnej rejestracji i niezarezerwowanej nazwie. **Miejsca:** `index.html:1497–1517`, `2253–2260`, `2284–2290`; `database.rules.json:28`.

Ktoś znający kod zespołu bez założyciela może wcześniej zarejestrować `<kod>.owner`. `makeOwner()` dostanie `email-already-in-use`; brak ścieżki odzyskania tej nazwy w kodzie webowym. To **nie przejmuje** istniejącego właściciela poprawnie związanego z UID.

**Działanie/test:** zaufane provisioning/członkostwo niezależne od publicznie rejestrowalnego e-maila i uwierzytelnione odzyskiwanie; test uprzednio zajętej nazwy nie przyznaje obcemu praw ani trwale nie blokuje uprawnionego tworzenia. Reguły RTDB nie sterują rejestracją Firebase Auth.

### CR-27 — Administrator zgłoszeń rozpoznawany wyłącznie po e-mailu

**Waga:** blocker, jeśli tożsamość administratora jest niezarezerwowana/osiągalna przez obcego. **Miejsce:** `database.rules.json:66`.

Pasujący e-mail tokenu wystarcza do czytania `feedback`, w tym kontaktu i logów. Nie sprawdzono istnienia/rezerwacji rzeczywistego konta administratora, więc nie jest to ustalenie aktualnego wycieku.

**Działanie/test:** przypięty zaufany UID/custom claim i kontrolowane nadawanie roli; nowa nieuprawniona tożsamość z pasującym e-mailem nie czyta zgłoszeń, właściwy administrator może.

### CR-28 — Publiczne zgłoszenia wymagają niezależnej ochrony przed nadużyciem

**Waga:** minor do czasu oceny wdrożenia. **Miejsca:** `database.rules.json:67–80`; `index.html:3664–3670`.

Create-only chroni istniejący wpis, nie liczbę nowych ID. Jeśli wdrożenie nie ma wystarczających limitów, wielokrotne zapisy zwiększą koszty i obciążenie obsługi. Nie oceniono App Check, zaufanego ingressu, budżetów ani monitoringu; nie wykonywano floodu. Anonimowy formularz sam w sobie nie jest błędem autoryzacji.

**Działanie/test:** ocena ochrony wdrożeniowej, w razie potrzeby zaufane limity, monitoring i budżety, z zachowaniem zamierzonego anonimowego zgłaszania. Licznik kontrolowany przez klienta ani samo App Check nie zastępują wiarygodnego limitu per aktor. Test kontrolowanego nadmiaru w środowisku testowym oraz braku obejścia przez bezpośredni zapis.

### CR-29 — Handoff to bearer capability, nie gwarantowana atomowa jednorazowość

**Waga:** minor/hardening; konsekwencja zależy od wycieku pełnego URL i żyjącego klucza. **Miejsca:** `index.html:1233–1239`, `1427–1453`; `database.rules.json:45`, `58–60`.

Posiadacz **całego** niezużytego linku — tokenu, ID i szyfrogramu — może odtworzyć hasło, jeżeli odpowiadający publiczny klucz nadal istnieje. Sam token obserwatora nie wystarcza. Przeglądarka usuwa klucz po sukcesie, best-effort; porażka lub błąd usuwania nie gwarantują konsumpcji. TTL, sprzątanie i entropia ID w desktopie są nieznane: nie potwierdzono bezterminowej ważności.

**Działanie/test:** jeśli wymagana jest rzeczywista jednorazowość, zaufana atomowa wymiana krótkotrwałego tokenu z expiry/replay protection i ograniczonym wynikiem zamiast ponownie używalnego hasła. Wymóg zalogowania przed odczytem klucza zepsułby bootstrap; `finally remove()` bez uprawnień nie gwarantuje usunięcia. Test expiry, dwóch równoczesnych realizacji, awarii i poprawnego logowania niezalogowanego odbiorcy.

## Antywzorce i możliwe przyszłe problemy

Najistotniejsze wzorce mają konkretne konsekwencje powyżej: **autoryzacja w UI przy współdzielonej tożsamości** (CR-08), **zaufanie do typów danych z zewnętrznego producenta** (CR-01/12/13/14), **globalny stan bez własności operacji asynchronicznej** (CR-06/07/11/20), **nazwy jako tożsamości** (CR-15/16), **pełne zastępowanie współdzielonych dokumentów** (CR-02/10) i **cache bez unieważniania** (CR-03).

`index.html:824–3679` łączy DOM, Firebase, uwierzytelnianie, obliczenia i stan globalny. Vanilla JS i statyczny hosting są odpowiednie dla tego produktu; sama liczba linii nie stanowi błędu. Przy naprawach warto stopniowo wydzielać czyste funkcje domenowe, adapter bazy i kontrolery widoków, zamiast planować kosztowny rewrite.

Do zmierzenia, nie jako potwierdzona regresja: `mapTick()` aktualizuje SVG co 100 ms (`index.html:3647`), a tłumaczenia obserwują zmienione/dodane węzły (`i18n_core.js:78–84`). `data-notr` dla czysto liczbowej mapy może ograniczyć pracę. Nie wykazano przyczyny problemu resize z Q01; nie przypisujemy jej pomiarom, których nie wykonano, ani nie otwieramy implementacji odłożonego D02.

Pozostałe decyzje właściciela/operatora: dopuszczalne masowe usuwanie danych przez członków, niezmienność powiązania nowego `obs` z zespołem, długość publicznych tematów ntfy, rzeczywista polityka haseł i wspierane przeglądarki. Są to obszary do ustalenia modelu zaufania i kompatybilności, nie dowiedzione nowe podatności.

### Kontrakty, które trzeba zachować przy naprawach

Reguły Firebase i formaty danych współdzieli nieobecny desktop. Nowe walidacje trzeba wdrażać z testami rzeczywistych obsługiwanych payloadów i ścieżką migracji; nie blokować starszych klientów bez planu. Stabilne ID kierowców wymagają mapowania istniejącej dostępności i planów. Migracja legacy owner musi poprzedzać usunięcie fallbacku. Zmiana modelu kont wymaga migracji logowania desktop/web, handoff i odzyskiwania. Ograniczanie subskrypcji nie może usunąć oczekiwanego późnego pobierania przebiegów z komputera kierowcy.

## Validation Gate — wykonane kontrole i ograniczenia

Nie ma `.ai/agentic.config.json` ani skonfigurowanej listy `validation.commands`. Nie inicjalizowano nowej infrastruktury pipeline podczas audytu. Brak bramki nie jest jej zaliczeniem; poniższe kontrole nie zastępują testów integracyjnych.

`<sesja>` oznacza `/home/user/.copilot/session-state/0f921fc4-4d79-4282-8688-2f4698a6b29b/files`. Skrypty pomocnicze pozostają artefaktami tej sesji, nie testami dodanymi do repozytorium.

| Komenda / kontrola | Status | Wynik / ograniczenie |
|---|---|---|
| `git rev-parse HEAD`, inwentarz `git ls-files` | PASS | Rewizja i zakres ustalone; brak śledzonego runnera testów/CI/lintera aplikacji |
| `node <sesja>/review-checks.cjs` | PASS | Składnia 6 skryptów JS i JSON reguł; 8 izolowanych reprodukcji |
| `node <sesja>/fourth-checks.cjs` — osobny weryfikator | PASS | 10 dodatkowych kontroli pozytywnych/negatywnych; m.in. identity matching, pusty fair share i odrzucone fałszywe XSS |
| Lokalny skaner HTML (`python3`, `HTMLParser`) | PASS | 0 brakujących statycznych lokalnych odwołań, 0 zduplikowanych ID |
| Inwentarz słowników w Node VM | PASS | 6 języków po 757 wpisów; nie jest to korekta jakości tłumaczeń |
| `git diff --check` i porównanie plików aplikacji | PASS | Brak zmian kodu aplikacji; brak błędów whitespace w śledzonym diffie |
| Skonfigurowane testy/lint/build | NOT RUN | Nie znaleziono skonfigurowanych komend; nie istnieje wynik „CI green” dla tego audytu |
| Firebase Rules/Auth Emulator | NOT RUN | Brak gotowego zestawu/configu i narzędzia; wnioski autoryzacji oparte na źródłach i semantyce |
| Przeglądarka, rzeczywisty DOM, accessibility, SRI, arkusz CSV | NOT RUN | Brak uruchomionego środowiska; VM nie dowodzi zachowania całego interfejsu |
| Produkcyjne reguły, Auth, CSP HTTP, App Check, TTL desktopu, backupy | NOT RUN | Wymagają uprawnionej osobnej kontroli operatora; nie wnioskowano ich stanu z brakujących plików |

Osiem reprodukcji pierwszego zestawu obejmuje surowe pola grafiku, stary cache porównania, mieszanie sesji, re-login, brak retry mapy, wyścig odpowiedzi toru, strefę czasu i reset dirty po starym zapisie. Drugi zestaw niezależnie sprawdza dodatkowe przepływy i testy negatywne. **PASS oznacza potwierdzenie oczekiwanego wyniku kontroli, także odtworzenie błędu — nie naprawienie aplikacji.**

## Rozstrzygnięcie wszystkich kandydatur trzech review

P = analiza główna, G = Gemini, K = Kimi. Tabela obejmuje również odrzucone podtezy, żeby nie traktować zgodności modeli jako dowodu.

| Kandydatura | Wynik niezależnej weryfikacji |
|---|---|
| P01 / G02 / K03: surowe pola grafiku, penalties, opon rywali, fair share, uszkodzenia, zakręty, SVG pozycji | CR-01; osobne sinki sprawdzone, nie założono, że każdy renderer liczbowy jest podatny |
| P01 / K03: XSS przez `delta` | Odrzucone: porównania `>0`/`<0` nie przepuszczają dowolnego tekstu HTML (`index.html:1740`) |
| G02: XSS przez `susp` | Odrzucone: bramka `v > 2` odrzuca dowolny tekst HTML (`index.html:867`) |
| G02: XSS przez `cmpCond` compound | Odrzucone: wynik jest escapowany przez `esc(d.join(', '))` (`index.html:3151`); negatywny test przeszedł |
| G02: brak escapowania apostrofu sam w sobie jest podatnością | Odrzucone: we wskazanych kontekstach tekstowych i atrybutach w podwójnych cudzysłowach nie wykazano niebezpiecznego użycia |
| P01 / K03: tokeny konkretnie w localStorage | Niepotwierdzone; nie określamy magazynu Firebase ani nie twierdzimy kradzieży tokenów |
| P02 | CR-03 |
| P03 | CR-04; nie rozciągamy błędu filtra na wszystkie podsumowania |
| P04 / G05: ponowne wejście do tego samego zespołu | CR-05 |
| G05: trwały wyciek listenerów przy zmianie zespołu | Odrzucone: inny kod zespołu celowo powoduje reload (`index.html:1527`) |
| P05: brak retry / spóźniony wynik toru | CR-06 / CR-07, dwa odrębne błędy |
| P06 | CR-08; nie zakładamy natychmiastowego zakończenia wszystkich aktywnych sesji |
| P06 / K02: naprawienie kontroli operacji Auth regułą RTDB | Odrzucone jako rozwiązanie: to odrębne usługi/autoryzacje |
| P07: wiele dodatkowych pól / wielokrotne zgłoszenia | CR-23 / warunkowe CR-28; obowiązują natywne limity wielkości Firebase |
| P08 | CR-09; zapis już używa epoch milliseconds; lokalna dostępność ma inną, zamierzoną semantykę |
| P09: monolit i globalny stan | Zalecenie architektoniczne powiązane z konkretnymi błędami, nie samodzielny major |
| P09: wszystkie puste catch automatycznie major | Odrzucone uogólnienie; konkretny nieobsłużony błąd mapy w CR-06, część operacji jest opcjonalna |
| P10: pełne zastępowanie i stare `lapsActual` | CR-10 |
| P10: stary zapis czyści dirty nowego edytora | CR-11 |
| P11: parser, zakresy, generator, dostępność, optimizer | CR-12; nie uruchamiano nieskończonej pętli i nie twierdzimy, że Infinity zapisuje się do Firebase |
| G01 / K04: member append i edytowalny temat | CR-02; zapis rodzica nie jest autoryzowany przez regułę potomka |
| G03 / K10d: SRI | CR-22, minor; nie wykazano CVE ani kompromitacji CDN |
| G03 / K10d: brak meta-CSP dowodzi braku CSP | Odrzucone: nagłówków HTTP nie sprawdzano |
| G04 / K05: brak schematów payloadów zespołu | Konkretne skutki w CR-01/12/13/14, bez dublowania ogólnego major |
| G04 / K05: członek może usuwać zwykłe dane/meta | Potwierdzony zakres własnego zespołu, ale zamierzone uprawnienia wymagają decyzji; nie wykazano eskalacji ani braku backupów |
| G04: nowy `obs` może deklarować obcy `team` | Obserwacja do hardeningu powiązania, nie dowód odczytu prywatnych danych obcego zespołu |
| G04: przejęcie istniejącego tokenu / prywatnych danych obcego zespołu | Odrzucone: istniejący token sprawdza dotychczasowe `data.team`; brak ścieżki propagacji uprawnień do obcych danych |
| G06 / K06: cleanup handoff tylko po sukcesie | CR-29, ograniczona gwarancja klienta |
| G06: `finally remove()` wystarczy | Odrzucone: niezalogowany klient nie ma gwarantowanego prawa usunięcia |
| G07(a): pełne kolekcje i indeksy | CR-21, minor; retencja i rzeczywista wydajność nieznane |
| G07(b): lifecycle listenerów i flaga requestu | CR-20, minor |
| G07(b): po `off` już nigdy nie odbierze wyniku | Odrzucone: listener nadal może odebrać późne `z`; zachować tę funkcję |
| G08 / K09: częste map redraw i tłumaczenie | Hipoteza wydajnościowa do pomiaru, nie potwierdzona regresja |
| G09(a) / K10b | CR-17, minor; potrzebny eksport i arkusz interpretujący formuły |
| G09(b) | CR-19 |
| G10(a) | CR-18 |
| G10(b): temat ntfy `rnd(6)` vs `rnd(8)` | Zalecenie ujednolicenia; oba używają CSPRNG, nie wykazano praktycznej enumeracji |
| G11(a) | CR-13 |
| G11(b): brak `updateUrl` jest błędem wysyłania zgłoszeń | Odrzucone: hook jest jawnie opcjonalny; podstawowy zapis do Firebase działa niezależnie, intencje wdrożeniowe nieznane |
| G12 / K11: testy aplikacji/reguł/CI/lint | CR-24; brak śledzonej bramki nie dowodzi braku kontroli poza repo |
| K01 | Warunkowe CR-25; niepotwierdzona obecność podatnego legacy rekordu i dostępnego konta |
| K02 | Warunkowe CR-26; nie przejmuje praw poprawnie związanego UID istniejącego założyciela |
| K05: brak backupów w repo oznacza brak backupów produkcji | Odrzucone: stan infrastruktury nieznany |
| K06: pełny wyciekły handoff URL ujawnia hasło przy żyjącym kluczu | Warunkowe CR-29; sam token obserwatora nie wystarcza |
| K06: klucz bezterminowy / ID ma słabą entropię | Niepotwierdzone: brak desktopu i jego TTL/sprzątania/generatora ID |
| K06: odczyt klucza tylko po uwierzytelnieniu | Odrzucone jako rozwiązanie: blokuje bootstrap logowania |
| K07: publiczny intake i nieograniczona liczba nowych ID | Warunkowe CR-28; anonimowość jest funkcją, ocenić ochronę wdrożeniową |
| K07: można zarejestrować administratora | Warunkowe CR-27, tylko gdy ta tożsamość rzeczywiście jest dostępna |
| K07: licznik klienta/reguł sam zapewnia rate limit | Odrzucone jako wystarczające rozwiązanie: wymagana wiarygodna, atomowa egzekucja poza kontrolą atakującego |
| K08: klucz Groq jest przypadkowo ujawniany członkom | Odrzucone: to jawnie współdzielony klucz, UI ujawnia tę zasadę (`index.html:680–682`); proxy/quota to decyzja modelu zaufania |
| K09: MutationObserver chodzi po całym body przy każdej zmianie | Odrzucone: callback przechodzi zmienione/dodane węzły; pełny walk występuje przy inicjalizacji/dodaniu słownika |
| K09: resize bez debounce wyjaśnia zgłoszone spowolnienie | Niepotwierdzone bez pomiarów; nie przypisujemy przyczyny Q01 |
| K10a: puste fair share | CR-14 |
| K10a: awaria trwa zawsze do reloadu | Odrzucone: poprawna następna próbka renderuje się w tym samym kontekście |
| K10c: dopasowanie imienia / kolizje kluczy dostępności | CR-15 / CR-16 |
| K10e: minimum 6 znaków | Zalecenie oceny skutecznej polityki Firebase; ustawień produkcji i rzeczywistych haseł nie badano |
| K10f: lookbehind i starszy Safari | Warunkowa kompatybilność; brak polityki wspieranych przeglądarek. Błąd parsowania całego `i18n_core.js` jest realny dla silnika bez tej składni |
| K10f: całkowicie łagodny fallback do PL | Odrzucone uogólnienie: `TR` ma fallback, ale selektor języka odwoła się do niezdefiniowanego `PWC_SET_LANG` |
| K11: brak testów kompletności słowników | Zalecenie w CR-24; `__I18N_MISS` nie jest zestawem regresji, nie wykazano konkretnego brakującego tłumaczenia |

**Świadome non-findings:** publiczny webowy `apiKey` Firebase nie jest sekretem serwerowym; `rnd()` korzysta z `crypto.getRandomValues`; kod zespołu pod `obs/<token>/team` nie ma publicznego uprawnienia odczytu. Nie przedstawiamy tych mechanizmów jako wycieku sekretów lub słabego RNG.

## Kolejność działań

1. Usunąć CR-01 i dodać testy granic zapisu/renderowania, w tym publicznego obserwatora.
2. Naprawić problemy major; szczególnie CR-02, CR-08, CR-10/11 i CR-15 wpływające na uprawnienia, współpracę i właściwe auto.
3. Uprawniony operator sprawdza warunki CR-25–CR-27 i ochronę intake; następnie ustala migracje bez łamania desktopu.
4. Wdrożyć małą bramkę regresji i pozostałe poprawki minor. Wydajność mierzyć przed zmianą architektury lub przypisaniem przyczyny problemowi resize.

Przed uznaniem poprawek za produkcyjnie zweryfikowane potrzebne są wskazane testy Firebase/Auth, rzeczywistego DOM i przeglądarki. Ten raport dokumentuje stan kodu i dowody offline, nie zastępuje tych kontroli.
