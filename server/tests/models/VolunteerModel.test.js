// test units for Volunteer model

const Volunteer = require('../../src/models/VolunteerModel');

describe('VolunteerModel', () => {

    describe('getAllVolunteers', () => {
        test('should return an array', () => {
            const volunteers = Volunteer.getAllVolunteers();
            expect(Array.isArray(volunteers)).toBe(true);
        });

        test('should return at least 2 volunteers', () => {
            const volunteers = Volunteer.getAllVolunteers();
            expect(volunteers.length).toBeGreaterThanOrEqual(2);
        });

        test('each volunteer should have required properties', () => {
            const volunteers = Volunteer.getAllVolunteers();
            volunteers.forEach(volunteer => {
                expect(volunteer).toHaveProperty('Volunteer_id');
                expect(volunteer).toHaveProperty('User_id');
                expect(volunteer).toHaveProperty('First_name');
                expect(volunteer).toHaveProperty('Last_name');
            });
        });
    });

    describe('getVolunteerWithId', () => {
        test('should return volunteer with ID 1', () => {
            const volunteer = Volunteer.getVolunteerWithId(1);
            expect(volunteer).toBeDefined();
            expect(volunteer.Volunteer_id).toBe(1);
            expect(volunteer.First_name).toBe('Michael');
            expect(volunteer.Last_name).toBe('Pearson');
        });

        test('should return volunteer with ID 2', () => {
            const volunteer = Volunteer.getVolunteerWithId(2);
            expect(volunteer).toBeDefined();
            expect(volunteer.Volunteer_id).toBe(2);
            expect(volunteer.First_name).toBe('Raymond');
            expect(volunteer.Last_name).toBe('Smith');
        });

        test('should return undefined for non-existent ID', () => {
            const volunteer = Volunteer.getVolunteerWithId(999);
            expect(volunteer).toBeUndefined();
        });

        test('should handle string ID', () => {
            const volunteer = Volunteer.getVolunteerWithId('1');
            expect(volunteer).toBeDefined();
            expect(volunteer.Volunteer_id).toBe(1);
        });
    });

    describe('getVolunteerWithUser_id', () => {
        test('should return volunteer for user_id 1', () => {
            const volunteer = Volunteer.getVolunteerWithUser_id(1);
            expect(volunteer).toBeDefined();
            expect(volunteer.User_id).toBe(1);
            expect(volunteer.First_name).toBe('Michael');
        });

        test('should return volunteer for user_id 2', () => {
            const volunteer = Volunteer.getVolunteerWithUser_id(2);
            expect(volunteer).toBeDefined();
            expect(volunteer.User_id).toBe(2);
            expect(volunteer.First_name).toBe('Raymond');
        });

        test('should return undefined for non-existent user_id', () => {
            const volunteer = Volunteer.getVolunteerWithUser_id(999);
            expect(volunteer).toBeUndefined();
        });

        test('should handle string user_id', () => {
            const volunteer = Volunteer.getVolunteerWithUser_id('1');
            expect(volunteer).toBeDefined();
            expect(volunteer.User_id).toBe(1);
        });
    });

    describe('createVolunteer', () => {
        test('should create a new volunteer with all fields', () => {
            const newVolunteer = {
                User_id: 999,
                First_name: 'Test',
                Middle_name: 'T',
                Last_name: 'User',
                phone_number: '123-456-7890',
                address_1: '123 Test St',
                address_2: 'Apt 1',
                city: 'Test City',
                state: 'TX',
                zip_code: '12345',
                Preferences: 'Test preferences',
                Available_days: 'monday,tuesday'
            };

            const created = Volunteer.createVolunteer(newVolunteer);
            
            expect(created).toHaveProperty('Volunteer_id');
            expect(created.User_id).toBe(999);
            expect(created.First_name).toBe('Test');
            expect(created.Last_name).toBe('User');
            expect(created.phone_number).toBe('123-456-7890');
        });

        test('should create volunteer without optional fields', () => {
            const newVolunteer = {
                User_id: 998,
                First_name: 'Simple',
                Last_name: 'Test',
                phone_number: '555-555-5555',
                address_1: '456 Simple St',
                city: 'Simple City',
                state: 'CA',
                zip_code: '54321'
            };

            const created = Volunteer.createVolunteer(newVolunteer);
            
            expect(created).toHaveProperty('Volunteer_id');
            expect(created.User_id).toBe(998);
            // Optional fields may be undefined
            expect(created.Middle_name === undefined || created.Middle_name === '').toBe(true);
            expect(created.address_2 === undefined || created.address_2 === '').toBe(true);
        });

        test('should generate unique Volunteer_id', () => {
            const volunteer1 = Volunteer.createVolunteer({
                User_id: 997,
                First_name: 'User1',
                Last_name: 'Test1',
                phone_number: '111-111-1111',
                address_1: '111 Test St',
                city: 'City1',
                state: 'TX',
                zip_code: '11111'
            });

            const volunteer2 = Volunteer.createVolunteer({
                User_id: 996,
                First_name: 'User2',
                Last_name: 'Test2',
                phone_number: '222-222-2222',
                address_1: '222 Test St',
                city: 'City2',
                state: 'CA',
                zip_code: '22222'
            });

            expect(volunteer1.Volunteer_id).not.toBe(volunteer2.Volunteer_id);
        });

        test('created volunteer should be retrievable', () => {
            const newVolunteer = Volunteer.createVolunteer({
                User_id: 995,
                First_name: 'Retrievable',
                Last_name: 'Test',
                phone_number: '333-333-3333',
                address_1: '333 Test St',
                city: 'City3',
                state: 'NY',
                zip_code: '33333'
            });

            const retrieved = Volunteer.getVolunteerWithId(newVolunteer.Volunteer_id);
            expect(retrieved).toBeDefined();
            expect(retrieved.First_name).toBe('Retrievable');
        });
    });

    describe('updateVolunteer', () => {
        test('should update existing volunteer', () => {
            // First create a volunteer to update
            const created = Volunteer.createVolunteer({
                User_id: 994,
                First_name: 'Original',
                Last_name: 'Name',
                phone_number: '444-444-4444',
                address_1: '444 Test St',
                city: 'Original City',
                state: 'TX',
                zip_code: '44444'
            });

            const updates = {
                First_name: 'Updated',
                Last_name: 'Person',
                city: 'Updated City'
            };

            const updated = Volunteer.updateVolunteer(created.Volunteer_id, updates);
            
            expect(updated).toBeDefined();
            expect(updated.First_name).toBe('Updated');
            expect(updated.Last_name).toBe('Person');
            expect(updated.city).toBe('Updated City');
            expect(updated.phone_number).toBe('444-444-4444'); // Unchanged
        });

        test('should update only specified fields', () => {
            const created = Volunteer.createVolunteer({
                User_id: 993,
                First_name: 'Partial',
                Last_name: 'Update',
                phone_number: '555-555-5555',
                address_1: '555 Test St',
                city: 'Test City',
                state: 'TX',
                zip_code: '55555'
            });

            const updates = {
                phone_number: '999-999-9999'
            };

            const updated = Volunteer.updateVolunteer(created.Volunteer_id, updates);
            
            expect(updated.phone_number).toBe('999-999-9999');
            expect(updated.First_name).toBe('Partial'); // Unchanged
            expect(updated.Last_name).toBe('Update'); // Unchanged
        });

        test('should return null or undefined for non-existent volunteer', () => {
            const result = Volunteer.updateVolunteer(99999, { First_name: 'Test' });
            expect(result === null || result === undefined).toBe(true);
        });

        test('should handle string volunteer_id', () => {
            const created = Volunteer.createVolunteer({
                User_id: 992,
                First_name: 'String',
                Last_name: 'Test',
                phone_number: '666-666-6666',
                address_1: '666 Test St',
                city: 'String City',
                state: 'TX',
                zip_code: '66666'
            });

            const updated = Volunteer.updateVolunteer(created.Volunteer_id.toString(), {
                First_name: 'StringUpdated'
            });

            expect(updated).toBeDefined();
            expect(updated.First_name).toBe('StringUpdated');
        });
    });

    describe('deleteVolunteer', () => {
        test('should delete existing volunteer', () => {
            const created = Volunteer.createVolunteer({
                User_id: 991,
                First_name: 'ToDelete',
                Last_name: 'User',
                phone_number: '777-777-7777',
                address_1: '777 Test St',
                city: 'Delete City',
                state: 'TX',
                zip_code: '77777'
            });

            const result = Volunteer.deleteVolunteer(created.Volunteer_id);
            expect(result).toBe(true);

            // Verify it's deleted
            const retrieved = Volunteer.getVolunteerWithId(created.Volunteer_id);
            expect(retrieved).toBeUndefined();
        });

        test('should return false for non-existent volunteer', () => {
            const result = Volunteer.deleteVolunteer(99999);
            expect(result).toBe(false);
        });

        test('should handle string volunteer_id', () => {
            const created = Volunteer.createVolunteer({
                User_id: 990,
                First_name: 'StringDelete',
                Last_name: 'Test',
                phone_number: '888-888-8888',
                address_1: '888 Test St',
                city: 'String Delete',
                state: 'TX',
                zip_code: '88888'
            });

            const result = Volunteer.deleteVolunteer(created.Volunteer_id.toString());
            expect(result).toBe(true);
        });
    });

});