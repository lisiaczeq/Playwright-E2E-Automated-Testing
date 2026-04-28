# Playwright-E2E-Automated-Testing
Zestaw automatycznych testów funkcjonalnych (E2E) dla systemów klasy ERP i HR. Projekt obejmuje automatyzację złożonych procesów biznesowych, weryfikację dostępności cyfrowej (WCAG) oraz testy integracyjne z wykorzystaniem frameworka Playwright.

Kluczowe Funkcjonalności:
* Automatyzacja procesów finansowych: Pełny cykl obsługi funduszy (sołeckich, osiedlowych) – od konfiguracji słowników po zatwierdzanie dokumentów.
* Zarządzanie uprawnieniami: Testowanie ról użytkowników, nadawanie dostępów i weryfikacja logiki warunkowej (try-catch).
* Integracja API: Przechwytywanie odpowiedzi serwera (response interception) i walidacja statusów HTTP.
* Bezpieczeństwo i sesja: Weryfikacja atrybutów ciasteczek sesyjnych oraz poprawności tokenów JWT.
* Audyt dostępności: Automatyczna weryfikacja standardów WCAG 2.1 przy użyciu AxeBuilder.
* Obsługa niestandardowego UI: Manipulacja DOM i manualne sterowanie przewijaniem (scrollTop) w kontenerach DevExtreme.
