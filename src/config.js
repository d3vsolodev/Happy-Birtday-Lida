// One place for the details of the site. Change them here and everything updates.
export const SITE = {
    name: 'Lida',
    sender: 'TH3AN',
    birthMonth: 11, // 1 = January ... 12 = December
    birthDay: 22,
    birthdayLabel: '22 November',
}

// days until the next birthday (0 = today)
export const daysUntilBirthday = () => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    let next = new Date(now.getFullYear(), SITE.birthMonth - 1, SITE.birthDay)
    if (next < today) next = new Date(now.getFullYear() + 1, SITE.birthMonth - 1, SITE.birthDay)
    return Math.round((next - today) / 86400000)
}
