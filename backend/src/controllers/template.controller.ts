import { Response } from 'express';
import * as templateService from '../services/template.service';
import { ContractType, ContractCategory } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

// ============================================================================
// CREATE TEMPLATE
// ============================================================================

export const createTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await templateService.createTemplate(
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    console.error('Create template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create template'
    });
  }
};

// ============================================================================
// GET TEMPLATE
// ============================================================================

export const getTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await templateService.getTemplateById(id, userId);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    console.error('Get template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to get template'
    });
  }
};

// ============================================================================
// LIST TEMPLATES
// ============================================================================

export const listTemplates = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      contractType,
      category,
      organizationId,
      isGlobal,
      search,
      tags,
      industry
    } = req.query;

    const filters: any = {};

    if (contractType) {
      filters.contractType = contractType as ContractType;
    }

    if (category) {
      filters.category = category as ContractCategory;
    }

    if (organizationId) {
      filters.organizationId = organizationId as string;
    }

    if (isGlobal !== undefined) {
      filters.isGlobal = isGlobal === 'true';
    }

    if (search) {
      filters.search = search as string;
    }

    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }

    if (industry) {
      filters.industry = Array.isArray(industry) ? industry : [industry];
    }

    const templates = await templateService.listTemplates(userId, filters);

    return res.status(200).json({
      success: true,
      data: templates,
      count: templates.length
    });
  } catch (error: any) {
    console.error('List templates error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to list templates'
    });
  }
};

// ============================================================================
// UPDATE TEMPLATE
// ============================================================================

export const updateTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await templateService.updateTemplate(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(200).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    console.error('Update template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update template'
    });
  }
};

// ============================================================================
// DELETE TEMPLATE
// ============================================================================

export const deleteTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await templateService.deleteTemplate(id, userId, ipAddress, userAgent);

    return res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to delete template'
    });
  }
};

// ============================================================================
// CLONE TEMPLATE
// ============================================================================

export const cloneTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, organizationId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Template name is required'
      });
    }

    const template = await templateService.cloneTemplate(
      id,
      name,
      userId,
      organizationId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    console.error('Clone template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to clone template'
    });
  }
};

// ============================================================================
// CREATE TEMPLATE VERSION
// ============================================================================

export const createTemplateVersion = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const template = await templateService.createTemplateVersion(
      id,
      req.body,
      userId,
      ipAddress,
      userAgent
    );

    return res.status(201).json({
      success: true,
      data: template
    });
  } catch (error: any) {
    console.error('Create template version error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to create template version'
    });
  }
};

// ============================================================================
// PREVIEW TEMPLATE
// ============================================================================

export const previewTemplate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { fieldValues } = req.body;

    if (!fieldValues) {
      return res.status(400).json({
        success: false,
        error: 'Field values are required for preview'
      });
    }

    const preview = await templateService.previewTemplate(id, fieldValues, userId);

    return res.status(200).json({
      success: true,
      data: preview
    });
  } catch (error: any) {
    console.error('Preview template error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to preview template'
    });
  }
};

// ============================================================================
// GET TEMPLATE USAGE STATS
// ============================================================================

export const getTemplateUsageStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const stats = await templateService.getTemplateUsageStats(id, userId);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('Get template usage stats error:', error);
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to get template usage stats'
    });
  }
};

export default {
  createTemplate,
  getTemplate,
  listTemplates,
  updateTemplate,
  deleteTemplate,
  cloneTemplate,
  createTemplateVersion,
  previewTemplate,
  getTemplateUsageStats
};
