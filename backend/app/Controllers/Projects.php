<?php

namespace App\Controllers;

use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use App\Models\ProjectModel;
use App\Models\BudgetModel;
use App\Models\ReleasesModel;
use App\Models\CounterpartFundModel;
use App\Models\SixPSModel;
use App\Models\UploadModel;

class Projects extends ResourceController
{
    /**
     * Return an array of resource objects, themselves in array format
     *
     * @return ResponseInterface
     */
    public function index()
    {
        $model = new ProjectModel();
        $data = $model->findAll();

        // Fetch totalBudget and yearly breakdown for each project
        $budgetModel = new BudgetModel();
        $releasesModel = new ReleasesModel(); 
        $counterpartFundModel = new CounterpartFundModel(); 
        $sixPSModel = new SixPSModel(); 
        $fileModel = new UploadModel(); 

        foreach ($data as &$project) {
            // Fetch totalBudget data
            $totalBudgetData = $budgetModel->where('project_id', $project['id'])->first();

            // Fetch yearly breakdown data
            $yearlyBreakdownData = $budgetModel->where('project_id', $project['id'])->findAll();
            $yearlyBreakdown = [];
            $budgetSum = 0;
            foreach ($yearlyBreakdownData as $item) {
                $yearlyBreakdown[$item['year']] = number_format($item['amount'], 2);
                $budgetSum += (float) $item['amount'];
            }

            if ($totalBudgetData && is_numeric($totalBudgetData['totalBudget'])) {
                $project['totalBudget'] = number_format($totalBudgetData['totalBudget'], 2);
            } elseif (!empty($yearlyBreakdown)) {
                $project['totalBudget'] = number_format($budgetSum, 2);
            } else {
                $project['totalBudget'] = null;
            }

            $project['budget'] = $yearlyBreakdown ? $yearlyBreakdown : null;

            // Fetch totalFund data
            $counterpartFundData = $counterpartFundModel->where('project_id', $project['id'])->first();

            $yearlyBreakdownData = $counterpartFundModel->where('project_id', $project['id'])->findAll();
            $yearlyBreakdown = [];
            $fundSum = 0;
            foreach ($yearlyBreakdownData as $item) {
                $yearlyBreakdown[$item['year']] = number_format($item['amount'], 2);
                $fundSum += (float) $item['amount'];
            }

            if ($counterpartFundData) {
                $counterpartFundData['totalFund'] = is_numeric($counterpartFundData['totalFund'])
                    ? number_format($counterpartFundData['totalFund'], 2)
                    : number_format($fundSum, 2);
                $project['counterpartFundData'] = $counterpartFundData;
            } elseif (!empty($yearlyBreakdown)) {
                $project['counterpartFundData'] = [
                    'project_id' => $project['id'],
                    'totalFund' => number_format($fundSum, 2),
                ];
            } else {
                $project['counterpartFundData'] = null;
            }

            $project['counterFund'] = $yearlyBreakdown ? $yearlyBreakdown : null;
        
            // Fetch release data for the project
            $releaseData = $releasesModel->where('project_id', $project['id'])->first();
            if ($releaseData) {
                // Format programmedAmount if it exists
                
                $project['releaseData'] = $releaseData;
            } else {
                $project['releaseData'] = null;
            }

            // Fetch 6Ps data for the project
            // $sixPSData = $sixPSModel->where('project_id', $project['id'])->first();
            // if ($sixPSData) {
            //     $project['sixPSData'] = $sixPSData;
            // } else {
            //     $project['sixPSData'] = null;
            // }

            // Retrieve main project data
            $sixPSData = $sixPSModel->where('project_id', $project['id'])->first();

            if ($sixPSData) {
                $project['sixPSData'] = $sixPSData;
                
                // Fetch yearly breakdown data
                $yearlyBreakdownData = $sixPSModel->where('project_id', $project['id'])->findAll();
                $yearlyBreakdown = [];

                foreach ($yearlyBreakdownData as $item) {
                    $yearlyBreakdown[$item['year']] = [
                        'targetPublication' => $item['targetPublication'],
                        'actualaccomplishmentPeer' => $item['actualaccomplishmentPeer'],
                        'actualaccomplishmentJournal' => $item['actualaccomplishmentJournal'],
                        'actualaccomplishmentPresented' => $item['actualaccomplishmentPresented'],
                        'details' => $item['details'],
                        'actualaccomplishmentIEC' => $item['actualaccomplishmentIEC'],
                        'targetProduct' => $item['targetProduct'],
                        'techName' => $item['techName'],
                        'techDescription' => $item['techDescription'],
                        'targetPatent' => $item['targetPatent'],
                        'agency' => $item['agency'],
                        'techNamePro' => $item['techNamePro'],
                        'statusSix' => $item['statusSix'],
                        'dost' => $item['dost'],
                        'patentNumber' => $item['patentNumber'],
                        'targetPeople' => $item['targetPeople'],
                        'namesBS' => $item['namesBS'],
                        'namesMS' => $item['namesMS'],
                        'namesPhD' => $item['namesPhD'],
                        'targetPlaces' => $item['targetPlaces'],
                        'cooperators' => $item['cooperators'],
                        'international' => $item['international'],
                        'privateSixPS' => $item['privateSixPS'],
                        'targetPolicy' => $item['targetPolicy'],
                        'policyRecommendation' => $item['policyRecommendation']
                    ];
                }

                $project['sixPs'] = $yearlyBreakdown ? $yearlyBreakdown : null;
            } else {
                $project['sixPSData'] = null;
            }


            $fileData = $fileModel->where('project_id', $project['id'])->first();
            if ($fileData) {
                $project['fileData'] = $fileData;
            } else {
                $project['fileData'] = null;
            }
        }
        

        return $this->respond($data);
    }


    /**
     * Return the properties of a resource object
     *
     * @return ResponseInterface
     */
    public function show($id = null)
    {
        // $model = new ProjectModel();
        // $data = $model->find(['id' => $id]);
        // if(!$data) return $this->failNotFound('No Data Found');
        // return $this->respond($data[0]);
        $model = new ProjectModel();
        $data = $model->find(['id' => $id]);

        if (!$data) {
            return $this->failNotFound('No Data Found');
        }

        // Fetch totalBudget for this project
        $budgetModel = new BudgetModel();
        $releasesModel = new ReleasesModel(); 
        $counterpartFundModel = new CounterpartFundModel(); 
        $sixPSModel = new SixPSModel(); 

        foreach ($data as &$project) {
            // Fetch totalBudget data
            $totalBudgetData = $budgetModel->where('project_id', $project['id'])->first();

            // Fetch yearly breakdown data
            $yearlyBreakdownData = $budgetModel->where('project_id', $project['id'])->findAll();
            $yearlyBreakdown = [];
            $budgetSum = 0;
            foreach ($yearlyBreakdownData as $item) {
                $yearlyBreakdown[$item['year']] = number_format($item['amount'], 2);
                $budgetSum += (float) $item['amount'];
            }

            if ($totalBudgetData && is_numeric($totalBudgetData['totalBudget'])) {
                $project['totalBudget'] = number_format($totalBudgetData['totalBudget'], 2);
            } elseif (!empty($yearlyBreakdown)) {
                $project['totalBudget'] = number_format($budgetSum, 2);
            } else {
                $project['totalBudget'] = null;
            }

            $project['budget'] = $yearlyBreakdown ? $yearlyBreakdown : null;

            // Fetch totalFund data
            $yearlyBreakdownData = $counterpartFundModel->where('project_id', $project['id'])->findAll();
            $yearlyBreakdown = [];
            foreach ($yearlyBreakdownData as $item) {
                $yearlyBreakdown[$item['year']] = number_format($item['amount'], 2);
            }
            $project['counterFund'] = $yearlyBreakdown ? $yearlyBreakdown : null;

            $yearlyBreakdownData = $sixPSModel->where('project_id', $project['id'])->findAll();
            $yearlyBreakdown = [];
            foreach ($yearlyBreakdownData as $item) {
                $yearlyBreakdown[$item['year']] = [
                    'targetPublication' => $item['targetPublication'],
                    'actualaccomplishmentPeer' => $item['actualaccomplishmentPeer'],
                    'actualaccomplishmentJournal' => $item['actualaccomplishmentJournal'],
                    'actualaccomplishmentPresented' => $item['actualaccomplishmentPresented'],
                    'details' => $item['details'],
                    'actualaccomplishmentIEC' => $item['actualaccomplishmentIEC'],
                    'targetProduct' => $item['targetProduct'],
                    'techName' => $item['techName'],
                    'techDescription' => $item['techDescription'],
                    'targetPatent' => $item['targetPatent'],
                    'agency' => $item['agency'],
                    'techNamePro' => $item['techNamePro'],
                    'statusSix' => $item['statusSix'],
                    'dost' => $item['dost'],
                    'patentNumber' => $item['patentNumber'],
                    'targetPeople' => $item['targetPeople'],
                    'namesBS' => $item['namesBS'],
                    'namesMS' => $item['namesMS'],
                    'namesPhD' => $item['namesPhD'],
                    'targetPlaces' => $item['targetPlaces'],
                    'cooperators' => $item['cooperators'],
                    'international' => $item['international'],
                    'privateSixPS' => $item['privateSixPS'],
                    'targetPolicy' => $item['targetPolicy'],
                    'policyRecommendation' => $item['policyRecommendation']
                ];
            }
            $project['sixPs'] = $yearlyBreakdown ? $yearlyBreakdown : null;
        
            // Fetch release data for the project
            // $releaseData = $releasesModel->where('project_id', $project['id'])->first();
            // if ($releaseData) {
            //     // Format programmedAmount if it exists
                
            //     $project['releaseData'] = $releaseData;
            // } else {
            //     $project['releaseData'] = null;
            // }
        }

        return $this->respond($data);
    }

    /**
     * Return a new resource object, with default properties
     *
     * @return ResponseInterface
     */
    public function new()
    {
        //
    }

    /**
     * Create a new resource object, from "posted" parameters
     *
     * @return ResponseInterface
     */
    public function create()
    {
        helper(['form']);
        $rules = [
            'projectCode' => '',
            'ISP' => '', 
            'programTitle' => '', 
            'projectTitle' => '', 
            'responsiblePerson' => '', 
            'funding' => '', 
            'implementingAgency' => '', 
            'programLeader' => '', 
            'emailAddress' => '', 
            'contactNumber' => '', 
            'postalAddress' => '', 
            'cooperatingAgency' => '', 
            'originalStart' => '', 
            'originalEnd' => '', 
            // 'changeStart' => '', 
            // 'changeImplementationDate' => '', 
            // 'firstExtension' => '', 
            // 'secondExtension' => '', 
            'objectives' => '', 
            'description' => '', 
            'deliverables' => '', 
            'beneficiaries' => '', 
            'status' => '', 
            'remarks' => '', 
        ];
        $projectData = [
            'projectCode' => $this->request->getVar('projectCode'),
            'ISP' => $this->request->getVar('ISP'),
            'programTitle' => $this->request->getVar('programTitle'),
            'projectTitle' => $this->request->getVar('projectTitle'),
            'responsiblePerson' => $this->request->getVar('responsiblePerson'),
            'funding' => $this->request->getVar('funding'),
            'implementingAgency' => $this->request->getVar('implementingAgency'),
            'programLeader' => $this->request->getVar('programLeader'),
            'emailAddress' => $this->request->getVar('emailAddress'),
            'contactNumber' => $this->request->getVar('contactNumber'),
            'postalAddress' => $this->request->getVar('postalAddress'),
            'cooperatingAgency' => $this->request->getVar('cooperatingAgency'),
            'originalStart' => $this->request->getVar('originalStart'),
            'originalEnd' => $this->request->getVar('originalEnd'),
            // 'changeStart' => $this->request->getVar('changeStart'),
            // 'changeImplementationDate' => $this->request->getVar('changeImplementationDate'),
            // 'firstExtension' => $this->request->getVar('firstExtension'),
            // 'secondExtension' => $this->request->getVar('secondExtension'),
            'objectives' => $this->request->getVar('objectives'),
            'description' => $this->request->getVar('description'),
            'deliverables' => $this->request->getVar('deliverables'),
            'beneficiaries' => $this->request->getVar('beneficiaries'),
            'status' => $this->request->getVar('status'),
            'remarks' => $this->request->getVar('remarks'),
            'created_by' => $this->request->getVar('created_by'),
        ];

        // if(!$this->validate($rules)) {
        //     return $this->fail($this->validator->getErrors());
        // }
        
        $model = new ProjectModel();
        $model->save($projectData);
        $projectId = $model->insertID();

        $releaseData = [
            'project_id' => $projectId,
        ];

        $Rmodel = new ReleasesModel();
        $Rmodel->save($releaseData);

        $counterFundData = $this->request->getVar('counterFund');
        if (!$counterFundData) {
            $counterFundData = $this->request->getVar('budget');
        }
        $totalFund = $this->request->getVar('totalFund');

        if ($counterFundData && is_array($counterFundData)) {
            $Cmodel = new CounterpartFundModel();
            foreach ($counterFundData as $counterItem) {
                $year = isset($counterItem['year']) ? $counterItem['year'] : ($counterItem->year ?? null);
                $amount = isset($counterItem['amount']) ? $counterItem['amount'] : 0;
                if (!is_numeric($amount)) {
                    $amount = 0;
                }

                $Cmodel->save([
                    'project_id' => $projectId,
                    'year' => $year,
                    'amount' => $amount,
                    'totalFund' => is_numeric($totalFund) ? $totalFund : 0,
                ]);
            }
        }

        $sixPSData = $this->request->getVar('budget') ?? [];
        $Smodel = new SixPSModel();

        if (is_array($sixPSData)) {
            foreach ($sixPSData as $index => $sixPSItem) {
                $year = $sixPSItem->year;
                // $amount = $budgetItem->amount;
                
                $Smodel->save([
                    'project_id' => $projectId,
                    // 'totalBudget' => $totalBudget,
                    'year' => $year,
                    // 'amount' => $amount
                ]);
            }
        }

        // $totalBudget = $this->request->getVar('totalBudget');
        $budgetData = $this->request->getVar('budget') ?? [];
        $totalBudget = $this->request->getVar('totalBudget');
        if (is_string($totalBudget)) {
            $totalBudget = str_replace(',', '', $totalBudget);
        }
        if (!is_numeric($totalBudget) && is_array($budgetData)) {
            $calculatedTotalBudget = 0;
            foreach ($budgetData as $budgetItem) {
                $amount = isset($budgetItem['amount']) ? $budgetItem['amount'] : 0;
                if (!is_numeric($amount)) {
                    $amount = 0;
                }
                $calculatedTotalBudget += $amount;
            }
            $totalBudget = $calculatedTotalBudget;
        }

        $budgetModel = new BudgetModel();
        if (is_array($budgetData)) {
            foreach ($budgetData as $budgetItem) {
                $year = isset($budgetItem['year']) ? $budgetItem['year'] : ($budgetItem->year ?? null);
                $amount = isset($budgetItem['amount']) ? $budgetItem['amount'] : 0;
                if (!is_numeric($amount)) {
                    $amount = 0;
                }

                $budgetModel->save([
                    'project_id' => $projectId,
                    'year' => $year,
                    'amount' => $amount,
                    'totalBudget' => is_numeric($totalBudget) ? $totalBudget : 0,
                ]);
            }
        }

        $fileData = [
            'project_id' => $projectId,
        ];

        $Fmodel = new UploadModel();
        $Fmodel->save($fileData);

        $response = [
            'status' => 201,
            'error' => null,
            'messages' => [
                'success' => 'Data Inserted'
            ]
        ];
        return $this->respondCreated($response);
    }


    /**
     * Return the editable properties of a resource object
     *
     * @return ResponseInterface
     */
    public function edit($id = null)
    {
        //
    }

    /**
     * Add or update a model resource, from "posted" properties
     *
     * @return ResponseInterface
     */
    public function update($id = null)
    {
        helper(['form']);
        $rules = [
            'projectCode' => '',
            'ISP' => '', 
            'programTitle' => '', 
            'projectTitle' => '', 
            'responsiblePerson' => '', 
            'funding' => '', 
            'implementingAgency' => '', 
            'programLeader' => '', 
            'emailAddress' => '', 
            'contactNumber' => '', 
            'postalAddress' => '', 
            'cooperatingAgency' => '', 
            'originalStart' => '', 
            'originalEnd' => '', 
            'changeStart' => '', 
            'changeImplementationDate' => '', 
            'firstExtension' => '', 
            'secondExtension' => '', 
            'objectives' => '', 
            'description' => '', 
            'deliverables' => '', 
            'beneficiaries' => '', 
            'dcY1Approval' => '',
            'gcY1Approval' => '',
            'execomY1Approval' => '',
            'dcY2Renewal' => '',
            'gcY2Renewal' => '',
            'execomY2Renewal' => '',
            'dcY3Renewal' => '',
            'gcY3Renewal' => '',
            'execomY3Renewal' => '',
            'inceptionMeeting' => '',
            'mande' => '',
            'y1BudgetRealignment' => '',
            'y2BudgetRealignment' => '',
            'y3BudgetRealignment' => '',
            'programReview' => '',
            'terminalReview' => '',
            'status' => '', 
            'remarks' => '', 
        ];

        $data = [
            'projectCode' => $this->request->getVar('projectCode'),
            'ISP' => $this->request->getVar('ISP'),
            'programTitle' => $this->request->getVar('programTitle'),
            'projectTitle' => $this->request->getVar('projectTitle'),
            'responsiblePerson' => $this->request->getVar('responsiblePerson'),
            'funding' => $this->request->getVar('funding'),
            'implementingAgency' => $this->request->getVar('implementingAgency'),
            'programLeader' => $this->request->getVar('programLeader'),
            'emailAddress' => $this->request->getVar('emailAddress'),
            'contactNumber' => $this->request->getVar('contactNumber'),
            'postalAddress' => $this->request->getVar('postalAddress'),
            'cooperatingAgency' => $this->request->getVar('cooperatingAgency'),
            'originalStart' => $this->request->getVar('originalStart'),
            'originalEnd' => $this->request->getVar('originalEnd'),
            'changeStart' => $this->request->getVar('changeStart'),
            'changeImplementationDate' => $this->request->getVar('changeImplementationDate'),
            'firstExtension' => $this->request->getVar('firstExtension'),
            'secondExtension' => $this->request->getVar('secondExtension'),
            'objectives' => $this->request->getVar('objectives'),
            'description' => $this->request->getVar('description'),
            'deliverables' => $this->request->getVar('deliverables'),
            'beneficiaries' => $this->request->getVar('beneficiaries'),
            'dcY1Approval' => $this->request->getVar('dcY1Approval'),
            'gcY1Approval' => $this->request->getVar('gcY1Approval'),
            'execomY1Approval' => $this->request->getVar('execomY1Approval'),
            'dcY2Renewal' => $this->request->getVar('dcY2Renewal'),
            'gcY2Renewal' => $this->request->getVar('gcY2Renewal'),
            'execomY2Renewal' => $this->request->getVar('execomY2Renewal'),
            'dcY3Renewal' => $this->request->getVar('dcY3Renewal'),
            'gcY3Renewal' => $this->request->getVar('gcY3Renewal'),
            'execomY3Renewal' => $this->request->getVar('execomY3Renewal'),
            'inceptionMeeting' => $this->request->getVar('inceptionMeeting'),
            'mande' => $this->request->getVar('mande'),
            'y1BudgetRealignment' => $this->request->getVar('y1BudgetRealignment'),
            'y2BudgetRealignment' => $this->request->getVar('y2BudgetRealignment'),
            'y3BudgetRealignment' => $this->request->getVar('y3BudgetRealignment'),
            'programReview' => $this->request->getVar('programReview'),
            'terminalReview' => $this->request->getVar('terminalReview'),
            'submissionTerminal' => $this->request->getVar('submissionTerminal'),
            'status' => $this->request->getVar('status'),
            'remarks' => $this->request->getVar('remarks'),
        ];
        // if(!$this->validate($rules)) return $this->fail($this->validator->getErrors());
        $model = new ProjectModel();
        $project = $model->find($id);

        if (!$project) {
            return $this->failNotFound('No Data Found');
        }

        $model->update($id, $data);

        $budgetData = $this->request->getVar('budget');
        $totalBudget = $this->request->getVar('totalBudget');
        if (is_string($totalBudget)) {
            $totalBudget = str_replace(',', '', $totalBudget);
        }
        $budgetModel = new BudgetModel();

        if ($budgetData && is_array($budgetData)) {
            if (!is_numeric($totalBudget)) {
                $calculatedTotalBudget = 0;
                foreach ($budgetData as $budgetItem) {
                    $amount = isset($budgetItem['amount']) ? $budgetItem['amount'] : 0;
                    if (!is_numeric($amount)) {
                        $amount = 0;
                    }
                    $calculatedTotalBudget += $amount;
                }
                $totalBudget = $calculatedTotalBudget;
            }

            foreach ($budgetData as $budgetItem) {
                $year = isset($budgetItem['year']) ? $budgetItem['year'] : ($budgetItem->year ?? null);
                $amount = isset($budgetItem['amount']) ? $budgetItem['amount'] : 0;
                if (!is_numeric($amount)) {
                    $amount = 0;
                }

                $existingBudget = $budgetModel->where([
                    'project_id' => $id,
                    'year' => $year
                ])->first();

                if ($existingBudget) {
                    $budgetModel->update($existingBudget['id'], [
                        'totalBudget' => is_numeric($totalBudget) ? $totalBudget : 0,
                        'amount' => $amount
                    ]);
                } else {
                    $budgetModel->save([
                        'project_id' => $id,
                        'totalBudget' => is_numeric($totalBudget) ? $totalBudget : 0,
                        'year' => $year,
                        'amount' => $amount
                    ]);
                }
            }
        }

        // $budgetRealignmentFile = $this->request->getFile('budgetRealignmentFile');
        // $changeImplementationFile = $this->request->getFile('changeImplementationFile');
        // $extensionFile = $this->request->getFile('extensionFile');

        // // Move uploaded files to the desired directory
        // $budgetRealignmentFileName = $budgetRealignmentFile->getName();
        // $changeImplementationFileName = $changeImplementationFile->getName();
        // $extensionFileName = $extensionFile->getName();

        // $budgetRealignmentFile->move(WRITEPATH . 'uploads', $budgetRealignmentFileName);
        // $changeImplementationFile->move(WRITEPATH . 'uploads', $changeImplementationFileName);
        // $extensionFile->move(WRITEPATH . 'uploads', $extensionFileName);
    

        $response = [
            'status' => 200,
            'error' => null,
            'messages' => [
                'success' => 'Data Updated'
            ]
        ];
        return $this->respond($response);
    }

    /**
     * Delete the designated resource object from the model
     *
     * @return ResponseInterface
     */
    public function delete($id = null)
    {
        $model = new ProjectModel();
        $project = $model->find($id);

        if (!$project) {
            return $this->failNotFound('No Data Found');
        }

        // Delete related records first
        $budgetModel = new BudgetModel();
        $budgetModel->where('project_id', $id)->delete();

        // Then delete the project itself
        $model->delete($id);

        $response = [
            'status' => 200,
            'error' => null,
            'messages' => [
                'success' => 'Data Deleted'
            ]
        ];
        return $this->respond($response);
    }

}
