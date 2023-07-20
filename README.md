# Monorepo

### Contracts Package

> run commands in contracts package script with `yarn contracts <command>`
> start local node with `yarn contracts start:dev`
> link packages with `yarn link`
> recompile typescript with `yarn contracts tsc`

### SDK Package

> link contracts with `yarn link "@vmexfinance/contracts"`
> run command in sdk package script with `yarn sdk <command>`
> recompule typescript with `yarn sdk tsc`
> start tests after starting local node in contracts package, use command `yarn sdk test` to begin sdk test workflow

#### Publishing to NPM

> create a `.npmrc` file in the root directory
> go to npmjs, make sure you're in the VMEX Finance org, and generate a token
> inside of the `.npmrc`, past this inside, replacing '{AUTH_TOKEN}' with your respective token:

```
//registry.npmjs.org/:_authToken={AUTH_TOKEN}
access=public
```

> from the root directory, run `lerna publish --no-private`

### Notes for auditors

The directory for all vmex audit information is under `packages/contracts/audits/vmex/`
