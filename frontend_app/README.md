# Transitely Flutter Frontend App

This folder contains a Flutter mobile frontend that uses the existing Transitely backend APIs.

## Implemented

- Portal screen (Rider/Driver choices)
- Rider login -> `POST /api/auth/rider/login`
- Driver login -> `POST /api/auth/driver/login`
- Token persistence via `SharedPreferences`

## Backend

The app expects backend on:

- `http://10.0.2.2:5000` (Android emulator)

Update `lib/core/app_config.dart` for physical device testing.

## Run

1. Install Flutter SDK and ensure `flutter` is available in PATH.
2. From this folder:

```bash
flutter pub get
flutter run
```

If you need full platform folders generated in this directory, run:

```bash
flutter create .
```

Then run `flutter pub get` again.
