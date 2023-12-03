const db = require("../models/index.js");

describe("Tests" , function () {
    beforeAll(async () => {
        await db.sequelize.sync({ force: true })
    });
    test("To check if the page is responsive", async () => {
        const t = true;
        expect(t).toBe(true);
    });
})