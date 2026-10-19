# Optional Cloudflare deployment

Use this file only after the user explicitly requests deployment. Use the
[`cf` CLI](https://github.com/cloudflare/cf), not a memorized Wrangler workflow.
Do not deploy, upload a preview, authenticate, or provision remote resources as
part of local explanation creation.

## Prepare

1. Check the installed CLI with `cf --help` and the selected command's help.
   `cf` is in beta; verify current syntax and configuration before use.
2. Read the current [project build and deployment guide](https://developers.cloudflare.com/cf/projects/)
   and [configuration guide](https://developers.cloudflare.com/cf/projects/cloudflare-config/).
3. Inspect the destination. Ask for missing account and deployment-target
   information. Do not infer permission to overwrite an existing Worker, attach
   a custom domain, or make private code public.
4. Check the final explanation for secrets and private source. Confirm the
   intended visibility with the user. Do not add authentication credentials to
   the explanation, HTML bundle, or committed configuration.

## Keep the local artifact independent

Deploy the built HTML as static assets. No application server, database, or
runtime code is needed. Keep `dist/index.html` usable locally without Cloudflare.
Prefer a separate staging directory for Cloudflare-specific setup, containing
only the verified HTML and the required deployment files. This prevents
deployment setup from changing the local build or uploading its source tree.

`cf deploy --prebuilt` expects Cloudflare Build Output, not an arbitrary `dist/`
directory. Use the current supported static-site setup and build path to produce
that output. Do not invent an `assets.directory` property in
`cloudflare.config.ts`; that file controls asset request behavior, not the asset
source. The build tool supplies the static assets.

`cf init`, `cf build`, and even `cf deploy --dry-run` can configure an unconfigured
project and install packages. Inspect planned changes and keep them in the
staging directory. Do not run automatic configuration against an existing app
without checking its configuration first.

## Validate and publish

Use the installed CLI's supported local build or dry-run validation first. Check
that the deployable assets contain only the intended explanation. A dry run is
not permission to run a real deployment.

Before the remote write, show the exact command, affected account and target,
and expected visibility. Get confirmation unless the user's request already
explicitly approves those exact details. Use existing authentication when
available. If sign-in is required, ask the user to complete the supported flow;
never ask them to paste a token into chat.

After deployment, report the actual URL returned by `cf`. Check the hosted
explanation if browser tools are available. If deployment fails, keep and report
the working local HTML; do not claim publication succeeded.
