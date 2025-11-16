import { Request, Response } from 'express';
import * as contractService from '../services/contract.service';
import { ContractType, ContractCategory, ContractStatus, ObligationStatus } from '@prisma/client';

// ============================================================================
// CREATE CONTRACT FROM TEMPLATE
// ============================================================================

export const createContractFromTemplate = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.body.organizationId;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const contract = await contractService.createContractFromTemplate(
      req.body,
      userId,
      organizationId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    console.error('Create contract from template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create contract from template'
    });
  }
};

// ============================================================================
// CREATE CONTRACT FROM SCRATCH
// ============================================================================

export const createContract = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const organizationId = req.body.organizationId;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        error: 'Organization ID is required'
      });
    }

    const contract = await contractService.createContract(
      req.body,
      userId,
      organizationId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    console.error('Create contract error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create contract'
    });
  }
};

// ============================================================================
// GET CONTRACT
// ============================================================================

export const getContract = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contract = await contractService.getContractById(id, userId);

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contract not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    console.error('Get contract error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to get contract'
    });
  }
};

// ============================================================================
// LIST CONTRACTS
// ============================================================================

export const listContracts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      organizationId,
      contractType,
      category,
      status,
      search,
      tags,
      expiringInDays,
      effectiveDateFrom,
      effectiveDateTo,
      minValue,
      maxValue,
      counterpartyName,
      page,
      limit
    } = req.query;

    const filters: any = {};

    if (organizationId) {
      filters.organizationId = organizationId as string;
    }

    if (contractType) {
      filters.contractType = contractType as ContractType;
    }

    if (category) {
      filters.category = category as ContractCategory;
    }

    if (status) {
      filters.status = status as ContractStatus;
    }

    if (search) {
      filters.search = search as string;
    }

    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }

    if (expiringInDays) {
      filters.expiringInDays = parseInt(expiringInDays as string);
    }

    if (effectiveDateFrom) {
      filters.effectiveDateFrom = new Date(effectiveDateFrom as string);
    }

    if (effectiveDateTo) {
      filters.effectiveDateTo = new Date(effectiveDateTo as string);
    }

    if (minValue) {
      filters.minValue = parseFloat(minValue as string);
    }

    if (maxValue) {
      filters.maxValue = parseFloat(maxValue as string);
    }

    if (counterpartyName) {
      filters.counterpartyName = counterpartyName as string;
    }

    const pageNum = page ? parseInt(page as string) : 1;
    const limitNum = limit ? parseInt(limit as string) : 20;

    const result = await contractService.listContracts(
      userId,
      filters,
      pageNum,
      limitNum
    );

    return res.status(200).json({
      success: true,
      data: result.contracts,
      pagination: {
        page: result.page,
        limit: limitNum,
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error: any) {
    console.error('List contracts error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to list contracts'
    });
  }
};

// ============================================================================
// UPDATE CONTRACT
// ============================================================================

export const updateContract = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contract = await contractService.updateContract(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    console.error('Update contract error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update contract'
    });
  }
};

// ============================================================================
// DELETE CONTRACT
// ============================================================================

export const deleteContract = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await contractService.deleteContract(id, userId, ipAddress, userAgent);

    return res.status(200).json({
      success: true,
      message: 'Contract deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete contract error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to delete contract'
    });
  }
};

// ============================================================================
// ARCHIVE CONTRACT
// ============================================================================

export const archiveContract = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contract = await contractService.archiveContract(
      id,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(200).json({
      success: true,
      data: contract
    });
  } catch (error: any) {
    console.error('Archive contract error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to archive contract'
    });
  }
};

// ============================================================================
// COUNTERPARTY MANAGEMENT
// ============================================================================

export const addCounterparty = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const counterparty = await contractService.addCounterparty(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: counterparty
    });
  } catch (error: any) {
    console.error('Add counterparty error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to add counterparty'
    });
  }
};

export const removeCounterparty = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id, counterpartyId } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await contractService.removeCounterparty(
      id,
      counterpartyId,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(200).json({
      success: true,
      message: 'Counterparty removed successfully'
    });
  } catch (error: any) {
    console.error('Remove counterparty error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to remove counterparty'
    });
  }
};

// ============================================================================
// OBLIGATION MANAGEMENT
// ============================================================================

export const addObligation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const obligation = await contractService.addObligation(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: obligation
    });
  } catch (error: any) {
    console.error('Add obligation error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to add obligation'
    });
  }
};

export const updateObligationStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { obligationId } = req.params;
    const { status, completionNotes } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const obligation = await contractService.updateObligationStatus(
      obligationId,
      status as ObligationStatus,
      userId,
      completionNotes,
      ipAddress,
      userAgent
    );

    return res.status(200).json({
      success: true,
      data: obligation
    });
  } catch (error: any) {
    console.error('Update obligation status error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update obligation status'
    });
  }
};

// ============================================================================
// MILESTONE MANAGEMENT
// ============================================================================

export const addMilestone = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const milestone = await contractService.addMilestone(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: milestone
    });
  } catch (error: any) {
    console.error('Add milestone error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to add milestone'
    });
  }
};

export const updateMilestoneStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { milestoneId } = req.params;
    const { status, completionNotes } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    const milestone = await contractService.updateMilestoneStatus(
      milestoneId,
      status,
      userId,
      completionNotes,
      ipAddress,
      userAgent
    );

    return res.status(200).json({
      success: true,
      data: milestone
    });
  } catch (error: any) {
    console.error('Update milestone status error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update milestone status'
    });
  }
};

// ============================================================================
// EXPIRING CONTRACTS
// ============================================================================

export const getExpiringContracts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { daysAhead } = req.query;
    const days = daysAhead ? parseInt(daysAhead as string) : 30;

    const contracts = await contractService.getExpiringContracts(userId, days);

    return res.status(200).json({
      success: true,
      data: contracts,
      count: contracts.length
    });
  } catch (error: any) {
    console.error('Get expiring contracts error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to get expiring contracts'
    });
  }
};

// ============================================================================
// STATISTICS
// ============================================================================

export const getStatistics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { organizationId } = req.query;

    const stats = await contractService.getContractStatistics(
      userId,
      organizationId as string | undefined
    );

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get statistics error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to get statistics'
    });
  }
};

export default {
  createContractFromTemplate,
  createContract,
  getContract,
  listContracts,
  updateContract,
  deleteContract,
  archiveContract,
  addCounterparty,
  removeCounterparty,
  addObligation,
  updateObligationStatus,
  addMilestone,
  updateMilestoneStatus,
  getExpiringContracts,
  getStatistics
};
