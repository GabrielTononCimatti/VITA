import cron from 'node-cron';
import {db} from "../config/firebaseConfig.js";


export const updateProjectStatus = cron.schedule('0 0 * * *', async () => {
    try {
        const now = new Date();
        const projectsRef = db.collection('projects');
        const snapshot = await projectsRef.where('status', '==', 'Em andamento').get();

        if (snapshot.empty) {
            console.log('No projects to update.');
            return;
        }

        snapshot.forEach(async (doc) =>
        {
            const project = doc.data();
            if(project.expectedEndDate)
            {

                const expectedEndDate = project.expectedEndDate.toDate();

                if (expectedEndDate < now)
                {
                    await projectsRef.doc(doc.id).update({ status: 'Em atraso' });
                    console.log(`Project ${doc.id} updated to Em atraso`);
                }
            }
        });

        console.log('Project status check completed.');
    } catch (error) {
        console.error('Error updating projects:', error);
    }
});

