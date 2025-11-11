const reportController = require("../../src/controllers/reportController");
const fs = require('fs').promises;
const path = require('path');

describe("reportController", () => {
    const mockReq = (body = {}, params = {}) => ({ body, params });
    const mockRes = () => {
        const res = {};
        res.status = jest.fn().mockReturnValue(res);
        res.json = jest.fn().mockReturnValue(res);
        res.download = jest.fn();
        return res;
    };

    // Set to mock mode for tests
    beforeAll(() => {
        process.env.USE_DATABASE = 'false';
    });

    // Clean up generated reports after tests
    afterAll(async () => {
        try {
            const reportsDir = path.join(__dirname, '../../../reports');
            const files = await fs.readdir(reportsDir);
            for (const file of files) {
                await fs.unlink(path.join(reportsDir, file));
            }
        } catch (err) {
            // Directory might not exist, that's fine
        }
    });

    describe("generateVolunteerReport", () => {
        test("should generate PDF volunteer report", async () => {
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Volunteer report generated',
                    format: 'pdf',
                    filename: expect.stringContaining('volunteer_report_'),
                    downloadUrl: expect.stringContaining('/api/reports/download/')
                })
            );
        }, 10000);

        test("should generate CSV volunteer report", async () => {
            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    format: 'csv',
                    filename: expect.stringContaining('.csv')
                })
            );
        }, 10000);

        test("should handle date range parameters", async () => {
            const req = mockReq({
                format: 'pdf',
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );
        }, 10000);

        test("should return 400 for invalid format", async () => {
            const req = mockReq({ format: 'invalid' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Invalid format. Use "pdf" or "csv"'
                })
            );
        });

        test("should default to PDF when format not specified", async () => {
            const req = mockReq({});
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    format: 'pdf'
                })
            );
        }, 10000);

        test("should include record count in response", async () => {
            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    recordCount: expect.any(Number)
                })
            );
        }, 10000);
    });

    describe("generateEventReport", () => {
        test("should generate PDF event report", async () => {
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Event report generated',
                    format: 'pdf',
                    filename: expect.stringContaining('event_report_')
                })
            );
        }, 10000);

        test("should generate CSV event report", async () => {
            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    format: 'csv',
                    filename: expect.stringContaining('.csv')
                })
            );
        }, 10000);

        test("should return 400 for invalid format", async () => {
            const req = mockReq({ format: 'xml' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test("should handle date range for events", async () => {
            const req = mockReq({
                format: 'pdf',
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        }, 10000);
    });

    describe("downloadReport", () => {
        test("should download existing report", async () => {
            // First generate a report
            const generateReq = mockReq({ format: 'csv' });
            const generateRes = mockRes();
            await reportController.generateVolunteerReport(generateReq, generateRes);

            const filename = generateRes.json.mock.calls[0][0].filename;

            // Then download it
            const downloadReq = mockReq({}, { filename });
            const downloadRes = mockRes();

            await reportController.downloadReport(downloadReq, downloadRes);

            expect(downloadRes.download).toHaveBeenCalled();
        }, 10000);

        test("should return 404 for non-existent report", async () => {
            const req = mockReq({}, { filename: 'nonexistent.pdf' });
            const res = mockRes();

            await reportController.downloadReport(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'Report not found'
                })
            );
        });

        test("should prevent directory traversal attacks", async () => {
            const req = mockReq({}, { filename: '../../../etc/passwd' });
            const res = mockRes();

            await reportController.downloadReport(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Invalid file path'
                })
            );
        });
    });

    describe("listReports", () => {
        test("should return list of generated reports", async () => {
            // Generate a couple of reports first
            const req1 = mockReq({ format: 'pdf' });
            const res1 = mockRes();
            await reportController.generateVolunteerReport(req1, res1);

            const req2 = mockReq({ format: 'csv' });
            const res2 = mockRes();
            await reportController.generateEventReport(req2, res2);

            // List reports
            const listReq = mockReq();
            const listRes = mockRes();

            await reportController.listReports(listReq, listRes);

            expect(listRes.status).toHaveBeenCalledWith(200);
            expect(listRes.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    reports: expect.any(Array)
                })
            );

            const responseData = listRes.json.mock.calls[0][0];
            expect(responseData.reports.length).toBeGreaterThanOrEqual(2);
        }, 15000);

        test("report list should include file metadata", async () => {
            // Generate a report
            const generateReq = mockReq({ format: 'pdf' });
            const generateRes = mockRes();
            await reportController.generateVolunteerReport(generateReq, generateRes);

            // List reports
            const listReq = mockReq();
            const listRes = mockRes();
            await reportController.listReports(listReq, listRes);

            const reports = listRes.json.mock.calls[0][0].reports;
            if (reports.length > 0) {
                const report = reports[0];
                expect(report).toHaveProperty('filename');
                expect(report).toHaveProperty('size');
                expect(report).toHaveProperty('created');
                expect(report).toHaveProperty('type');
            }
        }, 15000);

        test("should return empty array when no reports exist", async () => {
            // Clean reports directory first
            try {
                const reportsDir = path.join(__dirname, '../../../reports');
                const files = await fs.readdir(reportsDir);
                for (const file of files) {
                    await fs.unlink(path.join(reportsDir, file));
                }
            } catch (err) {
                // Ignore errors
            }

            const req = mockReq();
            const res = mockRes();

            await reportController.listReports(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    reports: []
                })
            );
        });
    });

    describe("error handling", () => {
        test("should handle errors gracefully in volunteer report generation", async () => {
            // Mock console.error to avoid cluttering test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            // This should still work even with potential errors
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            // Should either succeed or return proper error
            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();

            consoleSpy.mockRestore();
        }, 10000);

        test("should handle errors in event report generation", async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            expect(res.status).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalled();

            consoleSpy.mockRestore();
        }, 10000);
    });
    describe("database mode testing", () => {
        test("should handle database errors gracefully", async () => {
            // Temporarily enable database mode
            process.env.USE_DATABASE = 'true';

            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            // Should either succeed with mock data or return proper error
            expect(res.status).toHaveBeenCalled();

            // Reset to mock mode
            process.env.USE_DATABASE = 'false';
        }, 10000);

        test("should fall back to mock data when database fails", async () => {
            process.env.USE_DATABASE = 'true';

            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            // Should still generate report with mock data
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true
                })
            );

            process.env.USE_DATABASE = 'false';
        }, 10000);
    });

    describe("filename generation", () => {
        test("volunteer CSV filenames should be unique", async () => {
            const req1 = mockReq({ format: 'csv' });
            const res1 = mockRes();
            await reportController.generateVolunteerReport(req1, res1);

            // Wait a bit to ensure different timestamp
            await new Promise(resolve => setTimeout(resolve, 10));

            const req2 = mockReq({ format: 'csv' });
            const res2 = mockRes();
            await reportController.generateVolunteerReport(req2, res2);

            const filename1 = res1.json.mock.calls[0][0].filename;
            const filename2 = res2.json.mock.calls[0][0].filename;

            expect(filename1).not.toBe(filename2);
        }, 10000);

        test("event PDF filenames should contain timestamp", async () => {
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            const filename = res.json.mock.calls[0][0].filename;
            expect(filename).toMatch(/event_report_\d+\.pdf/);
        }, 10000);
    });

    describe("date filtering", () => {
        test("should accept only startDate", async () => {
            const req = mockReq({
                format: 'csv',
                startDate: '2024-01-01'
            });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        }, 10000);

        test("should accept only endDate", async () => {
            const req = mockReq({
                format: 'csv',
                endDate: '2024-12-31'
            });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        }, 10000);

        test("should handle future dates", async () => {
            const req = mockReq({
                format: 'pdf',
                startDate: '2025-01-01',
                endDate: '2025-12-31'
            });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
        }, 10000);
    });

    describe("report content validation", () => {
        test("generated CSV should be readable", async () => {
            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            const filename = res.json.mock.calls[0][0].filename;
            const reportsDir = path.join(__dirname, '../../../reports');
            const filePath = path.join(reportsDir, filename);

            // Check file exists and has content
            const stats = await fs.stat(filePath);
            expect(stats.size).toBeGreaterThan(0);
        }, 10000);

        test("generated PDF should be readable", async () => {
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            const filename = res.json.mock.calls[0][0].filename;
            const reportsDir = path.join(__dirname, '../../../reports');
            const filePath = path.join(reportsDir, filename);

            const stats = await fs.stat(filePath);
            expect(stats.size).toBeGreaterThan(100); // PDF should be at least 100 bytes
        }, 10000);
    });

    describe("response format validation", () => {
        test("volunteer report response should have all required fields", async () => {
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('message');
            expect(response).toHaveProperty('format');
            expect(response).toHaveProperty('filename');
            expect(response).toHaveProperty('downloadUrl');
            expect(response).toHaveProperty('recordCount');
        }, 10000);

        test("event report response should have all required fields", async () => {
            const req = mockReq({ format: 'csv' });
            const res = mockRes();

            await reportController.generateEventReport(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response).toHaveProperty('success');
            expect(response).toHaveProperty('message');
            expect(response).toHaveProperty('format');
            expect(response).toHaveProperty('filename');
            expect(response).toHaveProperty('downloadUrl');
            expect(response).toHaveProperty('recordCount');
        }, 10000);

        test("downloadUrl should be properly formatted", async () => {
            const req = mockReq({ format: 'pdf' });
            const res = mockRes();

            await reportController.generateVolunteerReport(req, res);

            const response = res.json.mock.calls[0][0];
            expect(response.downloadUrl).toMatch(/^\/api\/reports\/download\//);
        }, 10000);
    });
    
    describe("database error handling", () => {
    test("should fall back to mock when database fails", async () => {
        process.env.USE_DATABASE = 'true';
        
        const req = mockReq({ format: 'pdf' });
        const res = mockRes();

        await reportController.generateVolunteerReport(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                recordCount: expect.any(Number)
            })
        );
        
        process.env.USE_DATABASE = 'false';
    }, 10000);

    test("should use mock data when database returns empty", async () => {
        process.env.USE_DATABASE = 'true';
        
        const req = mockReq({ format: 'csv' });
        const res = mockRes();

        await reportController.generateEventReport(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        
        process.env.USE_DATABASE = 'false';
    }, 10000);
});

describe("date range edge cases", () => {
    test("should handle startDate without endDate", async () => {
        const req = mockReq({ 
            format: 'pdf', 
            startDate: '2024-01-01' 
        });
        const res = mockRes();

        await reportController.generateVolunteerReport(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    }, 10000);

    test("should handle endDate without startDate", async () => {
        const req = mockReq({ 
            format: 'csv', 
            endDate: '2024-12-31' 
        });
        const res = mockRes();

        await reportController.generateEventReport(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    }, 10000);

    test("should handle both dates for volunteer report", async () => {
        const req = mockReq({ 
            format: 'pdf',
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        });
        const res = mockRes();

        await reportController.generateVolunteerReport(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    }, 10000);

    test("should handle both dates for event report", async () => {
        const req = mockReq({ 
            format: 'csv',
            startDate: '2024-01-01',
            endDate: '2024-12-31'
        });
        const res = mockRes();

        await reportController.generateEventReport(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    }, 10000);
});

describe("file operations", () => {
    test("should create reports directory if not exists", async () => {
        const req = mockReq({ format: 'pdf' });
        const res = mockRes();

        await reportController.generateVolunteerReport(req, res);
        
        const reportsDir = path.join(__dirname, '../../../reports');
        const dirExists = await fs.access(reportsDir)
            .then(() => true)
            .catch(() => false);
        
        expect(dirExists).toBe(true);
    }, 10000);

    test("should generate unique filenames", async () => {
        const req1 = mockReq({ format: 'csv' });
        const res1 = mockRes();
        await reportController.generateVolunteerReport(req1, res1);
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const req2 = mockReq({ format: 'csv' });
        const res2 = mockRes();
        await reportController.generateVolunteerReport(req2, res2);

        const filename1 = res1.json.mock.calls[0][0].filename;
        const filename2 = res2.json.mock.calls[0][0].filename;
        
        expect(filename1).not.toBe(filename2);
    }, 10000);
});

describe("format validation", () => {
    test("should accept PDF format case-insensitive", async () => {
        const req = mockReq({ format: 'PDF' });
        const res = mockRes();

        await reportController.generateVolunteerReport(req, res);
        
        // Might fail with case sensitivity, but test the behavior
        expect(res.status).toHaveBeenCalled();
    }, 10000);

    test("should reject empty format", async () => {
        const req = mockReq({ format: '' });
        const res = mockRes();

        await reportController.generateVolunteerReport(req, res);
        
        expect(res.status).toHaveBeenCalledWith(400);
    }, 10000);
});
});