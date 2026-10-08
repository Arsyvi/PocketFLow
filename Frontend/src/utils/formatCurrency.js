function formatRibuan(value) {
    const digits = value.replace(/\D/g, "");
    return digits ? Number(digits).toLocaleString("id-ID") : "";
}

export default formatRibuan;