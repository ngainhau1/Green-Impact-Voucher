.PHONY: test build-contract frontend-build frontend-lint verify

test:
	cargo test

build-contract:
	stellar contract build --package impact-voucher

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

verify: test build-contract frontend-build frontend-lint
