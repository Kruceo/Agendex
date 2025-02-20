# Agendex

## Testing 

```bash
bun run dev
```

## Build

```bash
bun run build
```

## Packaging

### Fast: 

```bash
npx electron-builder --win --x64
npx electron-builder --linux AppImage deb
```

### Using Package.json

```json
// package.json
"build": {
  "appId": "com.kruceo.agendex",
  "productName": "Agendex",
  "win": {
    "target": "nsis"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Utility"
  }
}
```