---
name: domain-identifiers-use-schema-codecs
subject: Parsing and formatting domain identifiers
requirement: Use shared schema codecs to decode strings into typed domain
  identifiers and to encode those identifiers back to strings. Do not duplicate
  their parsing, validation, or formatting at call sites.
applicability: Applies where the project defines a shared identifier schema or
  codec. Literal fixture inputs, deliberately invalid test inputs, and
  independent expected strings in tests are allowed.
purpose: Keep identifier rules in one place and preserve validated domain types
  within application logic.
---
