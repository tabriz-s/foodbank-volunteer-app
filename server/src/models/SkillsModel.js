// mock data for SKILLS tables - all available skills in the system

let skills = [
    { Skills_id: 1, Description: 'Cooking', Category: 'Food_Preparation' },
    { Skills_id: 2, Description: 'Food Safety Certification', Category: 'Food_Preparation' },
    { Skills_id: 3, Description: 'Heavy Lifting', Category: 'Warehouse' },
    { Skills_id: 4, Description: 'Inventory Management', Category: 'Warehouse' },
    { Skills_id: 5, Description: 'CDL License', Category: 'Transportation' },
    { Skills_id: 6, Description: 'Safe Driving', Category: 'Transportation' },
    { Skills_id: 7, Description: 'Customer Service', Category: 'Distribution' },
    { Skills_id: 8, Description: 'Spanish Speaking', Category: 'Communication' },
    { Skills_id: 9, Description: 'First Aid Certification', Category: 'Safety' }
]

/* GETS */
// get all skills
const getAllSkills = () => {
    return skills;
};

// Get a specific skill by ID
const getSkillById = (id) => {
    return skills.find(skill => skill.Skills_id === parseInt(id));
};

// Check if a skill exists
const skillExists = (id) => {
    return skills.some(skill => skill.Skills_id === parseInt(id));
};

module.exports = {
    getAllSkills,
    getSkillById,
    skillExists
};