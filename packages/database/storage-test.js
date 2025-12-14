const { DocumentStore } = require('ravendb');
const { faker } = require('@faker-js/faker');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  ravendbUrl: 'http://localhost:8080',
  databaseName: 'ohriv-storage-test',
  testSizes: {
    small: { candidates: 50, applications: 100, evaluations: 200 },
    medium: { candidates: 500, applications: 1500, evaluations: 3000 },
    large: { candidates: 5000, applications: 20000, evaluations: 40000 }
  }
};

// Initialize RavenDB store
const store = new DocumentStore(CONFIG.ravendbUrl, CONFIG.databaseName);
store.initialize();

// Utility functions
function generateId(collection, identifier) {
  return `${collection}/${identifier}`;
}

function generateFileSize(minKB, maxKB) {
  return Math.floor(Math.random() * (maxKB - minKB + 1)) * 1024 + minKB * 1024;
}

function generateMockFile(type, sizeKB) {
  return `https://mock-storage.example.com/files/${crypto.randomUUID()}.${type}`;
}

// Generate a realistic candidate document
function generateCandidate(tenantId) {
  const candidateId = crypto.randomUUID();

  return {
    id: generateId('candidates', candidateId),
    collection: 'candidates',
    candidateId,
    tenantId,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    phone: faker.phone.number(),
    location: `${faker.location.city()}, ${faker.location.state()}`,
    professional: {
      title: faker.person.jobTitle(),
      summary: faker.lorem.paragraphs(3),
      experience: Array.from({ length: faker.number.int({ min: 1, max: 5 }) }, () => ({
        company: faker.company.name(),
        position: faker.person.jobTitle(),
        startDate: faker.date.past({ years: 10 }).toISOString().split('T')[0],
        description: faker.lorem.paragraph(),
        technologies: Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => faker.lorem.words())
      })),
      skills: Array.from({ length: faker.number.int({ min: 10, max: 30 }) }, () => ({
        name: faker.lorem.words(),
        category: faker.helpers.arrayElement(['technical', 'soft', 'language', 'tool']),
        proficiency: faker.number.int({ min: 1, max: 5 })
      }))
    },
    attachments: [
      {
        type: 'resume',
        url: generateMockFile('pdf', 250),
        title: 'Resume',
        fileName: `resume_${candidateId}.pdf`,
        fileSize: generateFileSize(200, 500),
        uploadedAt: faker.date.past().toISOString()
      },
      {
        type: 'cover_letter',
        url: generateMockFile('pdf', 150),
        title: 'Cover Letter',
        fileName: `cover_letter_${candidateId}.pdf`,
        fileSize: generateFileSize(100, 300),
        uploadedAt: faker.date.past().toISOString()
      }
    ],
    notes: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
      id: crypto.randomUUID(),
      content: faker.lorem.paragraph(),
      authorId: generateId('users', crypto.randomUUID()),
      createdAt: faker.date.past().toISOString()
    })),
    tags: Array.from({ length: faker.number.int({ min: 2, max: 8 }) }, () => faker.lorem.words()),
    status: 'active',
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
}

// Generate application document
function generateApplication(tenantId, candidateId) {
  const applicationId = crypto.randomUUID();

  return {
    id: generateId('applications', applicationId),
    collection: 'applications',
    applicationId,
    tenantId,
    candidateId,
    status: faker.helpers.arrayElement(['applied', 'in_process', 'screening', 'interviewing', 'offer', 'hired', 'rejected']),
    appliedAt: faker.date.past().toISOString(),
    evaluations: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => ({
      evaluatorId: generateId('users', crypto.randomUUID()),
      status: 'completed',
      overallScore: faker.number.int({ min: 60, max: 95 }),
      responses: Array.from({ length: faker.number.int({ min: 5, max: 15 }) }, () => ({
        questionId: crypto.randomUUID(),
        answer: faker.lorem.paragraph(),
        score: faker.number.int({ min: 1, max: 10 }),
        notes: faker.lorem.paragraph()
      }))
    })),
    notes: Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
      id: crypto.randomUUID(),
      content: faker.lorem.paragraph(),
      authorId: generateId('users', crypto.randomUUID()),
      createdAt: faker.date.past().toISOString()
    })),
    attachments: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }, () => ({
      type: faker.helpers.arrayElement(['resume', 'cover_letter', 'portfolio', 'assignment']),
      url: generateMockFile('pdf', 300),
      fileName: `${faker.lorem.words()}.pdf`,
      uploadedAt: faker.date.past().toISOString()
    })),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
}

// Generate evaluation document
function generateStageEvaluation(tenantId, applicationId, candidateId) {
  const evaluationId = crypto.randomUUID();

  return {
    id: generateId('stage-evaluations', evaluationId),
    collection: 'stage-evaluations',
    evaluationId,
    applicationId,
    candidateId,
    tenantId,
    evaluatorId: generateId('users', crypto.randomUUID()),
    evaluatorName: faker.person.fullName(),
    status: 'completed',
    completedAt: faker.date.recent().toISOString(),
    duration: faker.number.int({ min: 30, max: 180 }),
    responses: Array.from({ length: faker.number.int({ min: 10, max: 30 }) }, () => ({
      questionId: crypto.randomUUID(),
      question: faker.lorem.sentence(),
      answer: faker.lorem.paragraphs(2),
      score: faker.number.int({ min: 1, max: 10 }),
      notes: faker.lorem.paragraph(),
      attachments: faker.datatype.boolean({ probability: 0.2 }) ?
        Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => generateMockFile('pdf', 500)) : []
    })),
    scoring: {
      sectionScores: Array.from({ length: 3 }, (_, i) => ({
        sectionId: crypto.randomUUID(),
        sectionName: ['Technical Skills', 'Cultural Fit', 'Experience'][i],
        rawScore: faker.number.int({ min: 60, max: 95 }),
        weightedScore: faker.number.int({ min: 20, max: 35 }),
        maxScore: 40
      })),
      overallScore: faker.number.int({ min: 60, max: 95 }),
      recommendation: faker.helpers.arrayElement(['advance', 'hold', 'reject'])
    },
    notes: {
      candidateImpression: faker.lorem.paragraphs(2),
      culturalFit: faker.lorem.paragraph(),
      motivation: faker.lorem.paragraph(),
      careerGoals: faker.lorem.paragraph(),
      concerns: faker.lorem.paragraph()
    },
    recording: faker.datatype.boolean({ probability: 0.3 }) ? {
      audioUrl: generateMockFile('mp3', 15000), // 15MB audio
      videoUrl: generateMockFile('mp4', 75000), // 75MB video
      transcript: faker.lorem.paragraphs(20), // Large transcript
      duration: faker.number.int({ min: 1800, max: 7200 }), // 30-120 minutes
      size: faker.number.int({ min: 20000000, max: 100000000 }) // 20-100MB
    } : undefined,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString()
  };
}

// Create test database
async function createTestDatabase() {
  try {
    console.log('Creating test database...');

    const createDbPayload = {
      DatabaseName: CONFIG.databaseName,
      Settings: {}
    };

    const response = await fetch(`${CONFIG.ravendbUrl}/admin/databases`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createDbPayload)
    });

    if (response.ok) {
      console.log(`✓ Test database '${CONFIG.databaseName}' created successfully`);
    } else {
      const errorText = await response.text();
      if (errorText.includes('already exists')) {
        console.log(`✓ Test database '${CONFIG.databaseName}' already exists`);
      } else {
        throw new Error(`Failed to create database: ${errorText}`);
      }
    }
  } catch (error) {
    console.error('Error creating database:', error.message);
  }
}

// Get database size
async function getDatabaseSize() {
  try {
    const response = await fetch(`${CONFIG.ravendbUrl}/databases`);
    const data = await response.json();
    const db = data.Databases.find(d => d.Name === CONFIG.databaseName);
    return db ? db.TotalSize.SizeInBytes : 0;
  } catch (error) {
    console.error('Error getting database size:', error.message);
    return 0;
  }
}

// Generate test data
async function generateTestData(size) {
  const config = CONFIG.testSizes[size];
  const tenantId = `tenant-${size}-${Date.now()}`;

  console.log(`\n=== Generating ${size.toUpperCase()} test data ===`);
  console.log(`Target: ${config.candidates} candidates, ${config.applications} applications, ${config.evaluations} evaluations`);

  const startTime = Date.now();
  const results = {
    size,
    documents: {
      candidates: 0,
      applications: 0,
      evaluations: 0
    },
    storage: { before: 0, after: 0, growth: 0 },
    generationTime: 0
  };

  try {
    // Get initial database size
    results.storage.before = await getDatabaseSize();
    console.log(`Initial database size: ${(results.storage.before / 1024 / 1024).toFixed(2)} MB`);

    const session = store.openSession();

    // Generate candidates
    console.log('Creating candidates...');
    const candidates = [];
    for (let i = 0; i < config.candidates; i++) {
      const candidate = generateCandidate(tenantId);
      await session.store(candidate);
      candidates.push(candidate);
      results.documents.candidates++;

      if ((i + 1) % 100 === 0) {
        await session.saveChanges();
        console.log(`  Generated ${i + 1} candidates...`);
      }
    }

    // Generate applications
    console.log('Creating applications...');
    const applications = [];
    for (let i = 0; i < config.applications; i++) {
      const candidate = faker.helpers.arrayElement(candidates);
      const application = generateApplication(tenantId, candidate.candidateId);
      await session.store(application);
      applications.push(application);
      results.documents.applications++;

      if ((i + 1) % 200 === 0) {
        await session.saveChanges();
        console.log(`  Generated ${i + 1} applications...`);
      }
    }

    // Generate evaluations
    console.log('Creating evaluations...');
    for (let i = 0; i < config.evaluations; i++) {
      const application = faker.helpers.arrayElement(applications);
      const evaluation = generateStageEvaluation(
        tenantId,
        application.applicationId,
        application.candidateId
      );
      await session.store(evaluation);
      results.documents.evaluations++;

      if ((i + 1) % 500 === 0) {
        await session.saveChanges();
        console.log(`  Generated ${i + 1} evaluations...`);
      }
    }

    // Final save
    await session.saveChanges();
    console.log('✓ All documents saved successfully');

    // Get final database size
    results.storage.after = await getDatabaseSize();
    results.storage.growth = results.storage.after - results.storage.before;
    results.generationTime = Date.now() - startTime;

    console.log(`\n=== ${size.toUpperCase()} Test Results ===`);
    console.log(`Documents Created:`);
    console.log(`  Candidates: ${results.documents.candidates}`);
    console.log(`  Applications: ${results.documents.applications}`);
    console.log(`  Evaluations: ${results.documents.evaluations}`);
    console.log(`  Total: ${Object.values(results.documents).reduce((a, b) => a + b, 0)}`);

    console.log(`\nStorage Impact:`);
    console.log(`  Before: ${(results.storage.before / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  After: ${(results.storage.after / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Growth: ${(results.storage.growth / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Per Candidate: ${(results.storage.growth / results.documents.candidates / 1024).toFixed(2)} KB`);
    console.log(`  Per Evaluation: ${(results.storage.growth / results.documents.evaluations / 1024).toFixed(2)} KB`);

    console.log(`\nPerformance:`);
    console.log(`  Generation Time: ${(results.generationTime / 1000).toFixed(2)} seconds`);

    return results;

  } catch (error) {
    console.error(`Error generating ${size} test data:`, error);
    throw error;
  }
}

// Main analysis function
async function runStorageAnalysis() {
  console.log('🚀 Starting RavenDB Storage Analysis for Recruitment Platform');
  console.log('='.repeat(60));

  try {
    await createTestDatabase();
    const results = [];

    // Test small scale first
    console.log('\nRunning SMALL scale test...');
    const smallResult = await generateTestData('small');
    results.push(smallResult);

    // Wait for database to settle
    console.log('\nWaiting for database to settle...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Test medium scale
    console.log('\nRunning MEDIUM scale test...');
    const mediumResult = await generateTestData('medium');
    results.push(mediumResult);

    // Generate final report
    console.log('\n' + '='.repeat(60));
    console.log('📊 FINAL STORAGE ANALYSIS REPORT');
    console.log('='.repeat(60));

    results.forEach(result => {
      console.log(`\n${result.size.toUpperCase()} TENANT:`);
      console.log(`  Scale: ${result.documents.candidates} candidates, ${result.documents.evaluations} evaluations`);
      console.log(`  Storage Used: ${(result.storage.growth / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Storage per Candidate: ${(result.storage.growth / result.documents.candidates / 1024).toFixed(2)} KB`);
      console.log(`  Storage per Evaluation: ${(result.storage.growth / result.documents.evaluations / 1024).toFixed(2)} KB`);
    });

    // Calculate projections using medium as baseline
    const mediumData = results.find(r => r.size === 'medium');
    if (mediumData) {
      const storagePerCandidate = mediumData.storage.growth / mediumData.documents.candidates / 1024; // KB
      const storagePerEvaluation = mediumData.storage.growth / mediumData.documents.evaluations / 1024; // KB

      console.log('\n📈 STORAGE PROJECTIONS:');
      console.log('-'.repeat(30));
      console.log(`Small Tenant (50 candidates): ${(storagePerCandidate * 50 / 1024).toFixed(2)} MB`);
      console.log(`Medium Tenant (500 candidates): ${(storagePerCandidate * 500 / 1024).toFixed(2)} MB`);
      console.log(`Large Tenant (5000 candidates): ${(storagePerCandidate * 5000 / 1024).toFixed(2)} MB`);

      console.log('\n📅 MONTHLY GROWTH ESTIMATES:');
      console.log('-'.repeat(30));
      console.log(`Storage per new candidate: ${(storagePerCandidate / 1024).toFixed(2)} MB`);
      console.log(`Storage per evaluation: ${(storagePerEvaluation / 1024).toFixed(2)} KB`);

      const monthlyGrowth = (storagePerCandidate * 0.1 * 500 + storagePerEvaluation * 1500) / 1024;
      console.log(`Estimated monthly growth (500 candidates + 1500 evaluations): ${monthlyGrowth.toFixed(2)} MB`);

      console.log('\n💰 COST ANALYSIS:');
      console.log('-'.repeat(30));
      console.log(`AWS S3 Standard Storage (First 50TB): $0.023 per GB`);
      console.log(`Monthly storage cost per 500 candidates: $${(storagePerCandidate * 500 / 1024 / 1024 * 0.023).toFixed(2)}`);
      console.log(`Annual storage cost per 500 candidates: $${(storagePerCandidate * 500 / 1024 / 1024 * 0.023 * 12).toFixed(2)}`);

      // Additional insights
      console.log('\n🔍 KEY INSIGHTS:');
      console.log('-'.repeat(30));

      const avgEvalSize = storagePerEvaluation;
      const hasRecordings = avgEvalSize > 1000; // If evaluations are >1MB, likely has recordings

      console.log(`• Average evaluation size: ${avgEvalSize.toFixed(2)} KB ${hasRecordings ? '(includes recordings)' : '(text only)'}`);
      console.log(`• Storage is primarily driven by: ${hasRecordings ? 'Video/audio recordings in evaluations' : 'Candidate profiles and attachments'}`);
      console.log(`• Storage growth per active user: ${((storagePerCandidate * 0.1 + storagePerEvaluation * 3) / 1024).toFixed(2)} MB/month`);

      // Cost threshold analysis
      const monthlyCostPerTenant = storagePerCandidate * 500 / 1024 / 1024 * 0.023;
      console.log(`• Storage becomes significant cost driver at: ${monthlyCostPerTenant > 5 ? '500+ candidates (current tier)' : '1000+ candidates (next tier)'}`);
      console.log(`• Recommended storage quotas: Small (50 candidates) = ${(storagePerCandidate * 50 / 1024).toFixed(1)}MB, Medium (500) = ${(storagePerCandidate * 500 / 1024).toFixed(1)}MB`);

      // Save results to file
      const reportData = {
        timestamp: new Date().toISOString(),
        testConfiguration: CONFIG,
        results,
        projections: {
          storagePerCandidate: storagePerCandidate,
          storagePerEvaluation: storagePerEvaluation,
          monthlyGrowthPerActiveCandidate: (storagePerCandidate * 0.1 + storagePerEvaluation * 3) / 1024
        },
        costs: {
          storageCostPerGB: 0.023,
          monthlyCostPer500Candidates: monthlyCostPerTenant,
          annualCostPer500Candidates: monthlyCostPerTenant * 12
        },
        insights: {
          avgEvalSize: avgEvalSize,
          hasRecordings: hasRecordings,
          costThreshold: monthlyCostPerTenant > 5 ? '500+ candidates' : '1000+ candidates'
        }
      };

      fs.writeFileSync(
        path.join(process.cwd(), 'storage-analysis-report.json'),
        JSON.stringify(reportData, null, 2)
      );

      console.log('\n📄 Detailed report saved to: storage-analysis-report.json');
    }

  } catch (error) {
    console.error('Storage analysis failed:', error);
    throw error;
  } finally {
    store.dispose();
  }
}

// Run the analysis
if (require.main === module) {
  runStorageAnalysis().catch(console.error);
}

module.exports = { runStorageAnalysis, generateTestData, getDatabaseSize, CONFIG };