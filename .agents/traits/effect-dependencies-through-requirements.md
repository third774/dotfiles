---
name: effect-dependencies-through-requirements
subject: Dependency composition in Effect programs and service layers
requirement: Express service dependencies through Effect or Layer requirements,
  not function parameters that accept layers. Satisfy those requirements with
  Effect.provide or Layer.provide at the boundary that runs the program.
applicability: Applies to reusable application logic and service composition. A
  service default layer may resolve dependencies owned by its implementation.
  Application and request boundary constructors may accept layers to select
  implementations, including test implementations.
purpose: Keep dependencies visible in types and let application and test
  boundaries select implementations.
---
