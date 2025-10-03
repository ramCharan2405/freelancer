const mongoose = require('mongoose');
const User = require('../models/User');
const Company = require('../models/Company');
require('dotenv').config({ path: '../.env' });

const cleanupAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);



        const companyUsers = await User.find({ role: 'company' });


        let orphanedCount = 0;
        for (const user of companyUsers) {
            const company = await Company.findOne({ user: user._id });
            if (!company) {

                await User.findByIdAndDelete(user._id);
                orphanedCount++;
            }
        }




        const companies = await Company.find();


        let orphanedCompanies = 0;
        for (const company of companies) {
            const user = await User.findById(company.user);
            if (!user) {

                await Company.findByIdAndDelete(company._id);
                orphanedCompanies++;
            }
        }





    }`);
        }`);

    await mongoose.connection.close();


} catch (error) {

    process.exit(1);
}
};

cleanupAll();