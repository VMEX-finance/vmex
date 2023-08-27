# Vmex Protocol Sdk

## Scripts usage

### set-global-admin

```
NEW_ADMIN=... yarn scripts:update-global-admin:sepolia
```

### verify-tranche

```
TRANCHE_ID=... yarn scripts:verify-tranche:sepolia
```

### set-risk-params

Temporary way to set risk parameters, users have to manually go inside src.ts/scripts/admin.ts and change the aToken address, risk param values, and tranche id.

```
# DANGER: MAKE SURE YOU CHANGE THE SCRIPT FIRST
yarn scripts:set-risk-params:sepolia
```
