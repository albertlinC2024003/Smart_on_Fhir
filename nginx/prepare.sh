#!/bin/sh
# 因為啟動時emr.conf會掛載到nginx目錄下的default.conf 導致替換失敗(檔案被使用中)
# 所以改為emr.conf先掛載到default.conf.template檔案 再由prepare.sh替換後產生default.conf
HASHES=$(find /usr/share/nginx/html/assets -name "*.js" -type f | while read -r JS_FILE; do
    HASH=$(sha256sum "$JS_FILE" | awk '{print $1}')
    HASH_B64=$(echo -n "$HASH" | xxd -r -p | base64)
    printf "'sha256-%s' " "$HASH_B64"
done)
echo "final CSP-header: $HASHES"
echo "preparing nginx default.conf.template..."
sed "s|%SHA256_B64%|$HASHES|g" /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
cat /etc/nginx/conf.d/default.conf
exec nginx -g "daemon off;"