# Mocking system boundaries

Mock only a boundary outside the owned behavior:

- third-party API;
- clock or randomness;
- filesystem or operating-system process when a real temporary resource is too costly;
- database only when a real isolated test database is impractical.

Pass the boundary through a narrow dependency whose methods represent real
operations. Avoid a generic conditional fetcher and avoid mocking owned modules.

Record why the mock is necessary. If a fake becomes more complex than the
boundary contract, prefer a real local dependency or contract fixture.
