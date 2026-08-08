# Model upgrade

## Enriched

### Thin stubs (full authority body rewrite)

MacBook size/chip stubs: `macbook-air-13`, `macbook-air-15`, `macbook-air-m4`, `macbook-air-m5`, `macbook-pro-14`, `macbook-pro-16`  
MSI stubs: `msi-katana-15`, `msi-cyborg-15`, `msi-raider-18`, `msi-stealth-14`, `msi-stealth-16`, `msi-vector-16-hx`  
Other: `lenovo-legion-pro-7`, `samsung-galaxy-book`

### Mid-tier (append only — preserved unique prose)

~24 models including Zephyrus G14/G16, Alienware M-series, HP Omen/Victus, Dell XPS/Inspiron, Acer Nitro/Predator, etc.

## Deferred

Models already ≥~380 words with adequate unique value — no forced padding.

## Guardrails

- Specs limited to `popularModels` + multi-config disclaimer
- FAIL_DATA scan on authority sections: **0**
- Average: 79.2 → **84.1**
