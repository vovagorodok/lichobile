echo "
{
    \"apiEndPoint\": \"https://lichess.org\",
    \"socketEndPoint\": \"wss://socket.lichess.org\"
}" > appconfig.prod.json

npm install
APP_MODE=dev APP_CONFIG=prod npm run build
npx cap sync