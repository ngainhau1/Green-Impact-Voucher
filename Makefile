.PHONY: test build-contract backend-build backend-test backend-lint frontend-build frontend-lint verify

test:
	cargo test

build-contract:
	stellar contract build --package impact-voucher

backend-build:
	cd backend && npm run build

backend-test:
	cd backend && npm test

backend-lint:
	cd backend && npm run lint

frontend-build:
	cd frontend && npm run build

frontend-lint:
	cd frontend && npm run lint

verify: test build-contract backend-build backend-test backend-lint frontend-build frontend-lint
