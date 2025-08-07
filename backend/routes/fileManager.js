const express = require('express');
const router = express.Router();
const { logger } = require('../utils/logger');
const { validateRequest, validateQuery, validateParams, schemas, querySchemas, paramSchemas } = require('../middleware/validationMiddleware');
const multer = require('multer');
const path = require('path');

// 文件管理服務
const fileManagerService = require('../services/fileManagerService');

// 配置 Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 10
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('不支持的文件類型'));
    }
  }
});

// 上傳文件
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files;
    const { category, description, tags } = req.body;
    const userId = req.user.id;
    
    const uploadedFiles = await fileManagerService.uploadFiles(userId, files, {
      category,
      description,
      tags: tags ? JSON.parse(tags) : []
    });
    
    res.json({ success: true, data: uploadedFiles });
  } catch (error) {
    logger.error('上傳文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_UPLOAD_ERROR', message: error.message || '上傳文件失敗' } 
    });
  }
});

// 獲取文件列表
router.get('/', validateQuery(querySchemas.fileQuery), async (req, res) => {
  try {
    const { page = 1, limit = 20, category, type, search, sortBy, sortOrder } = req.validatedQuery;
    const userId = req.user.id;
    
    const files = await fileManagerService.getFileList(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      type,
      search,
      sortBy,
      sortOrder
    });
    
    res.json({ success: true, data: files });
  } catch (error) {
    logger.error('獲取文件列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_LIST_ERROR', message: error.message || '獲取文件列表失敗' } 
    });
  }
});

// 獲取文件詳情
router.get('/:fileId', validateParams(paramSchemas.fileIdParam), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const userId = req.user.id;
    
    const file = await fileManagerService.getFileDetail(fileId, userId);
    
    res.json({ success: true, data: file });
  } catch (error) {
    logger.error('獲取文件詳情錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_DETAIL_ERROR', message: error.message || '獲取文件詳情失敗' } 
    });
  }
});

// 下載文件
router.get('/:fileId/download', validateParams(paramSchemas.fileIdParam), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const userId = req.user.id;
    
    const fileData = await fileManagerService.downloadFile(fileId, userId);
    
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    res.send(fileData.buffer);
  } catch (error) {
    logger.error('下載文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_DOWNLOAD_ERROR', message: error.message || '下載文件失敗' } 
    });
  }
});

// 預覽文件
router.get('/:fileId/preview', validateParams(paramSchemas.fileIdParam), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const userId = req.user.id;
    
    const previewData = await fileManagerService.previewFile(fileId, userId);
    
    res.setHeader('Content-Type', previewData.mimeType);
    res.send(previewData.buffer);
  } catch (error) {
    logger.error('預覽文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_PREVIEW_ERROR', message: error.message || '預覽文件失敗' } 
    });
  }
});

// 更新文件信息
router.put('/:fileId', validateParams(paramSchemas.fileIdParam), validateRequest(schemas.updateFile), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const { name, description, category, tags } = req.validatedBody;
    const userId = req.user.id;
    
    const file = await fileManagerService.updateFile(fileId, userId, {
      name,
      description,
      category,
      tags
    });
    
    res.json({ success: true, data: file });
  } catch (error) {
    logger.error('更新文件信息錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_UPDATE_ERROR', message: error.message || '更新文件信息失敗' } 
    });
  }
});

// 刪除文件
router.delete('/:fileId', validateParams(paramSchemas.fileIdParam), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const userId = req.user.id;
    
    const result = await fileManagerService.deleteFile(fileId, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('刪除文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_DELETE_ERROR', message: error.message || '刪除文件失敗' } 
    });
  }
});

// 圖片處理
router.post('/:fileId/process', validateParams(paramSchemas.fileIdParam), validateRequest(schemas.imageProcessing), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const { operations } = req.validatedBody;
    const userId = req.user.id;
    
    const processedFile = await fileManagerService.processImage(fileId, userId, operations);
    
    res.json({ success: true, data: processedFile });
  } catch (error) {
    logger.error('圖片處理錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'IMAGE_PROCESSING_ERROR', message: error.message || '圖片處理失敗' } 
    });
  }
});

// 批量操作文件
router.post('/batch-action', validateRequest(schemas.batchFileAction), async (req, res) => {
  try {
    const { fileIds, action, data } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await fileManagerService.batchAction(fileIds, action, data, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('批量操作文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'BATCH_FILE_ACTION_ERROR', message: error.message || '批量操作文件失敗' } 
    });
  }
});

// 獲取文件統計
router.get('/stats/overview', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const stats = await fileManagerService.getFileStats(userId);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('獲取文件統計錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_STATS_ERROR', message: error.message || '獲取文件統計失敗' } 
    });
  }
});

// 獲取存儲使用情況
router.get('/stats/storage', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const storageStats = await fileManagerService.getStorageStats(userId);
    
    res.json({ success: true, data: storageStats });
  } catch (error) {
    logger.error('獲取存儲使用情況錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'STORAGE_STATS_ERROR', message: error.message || '獲取存儲使用情況失敗' } 
    });
  }
});

// 創建文件夾
router.post('/folder', validateRequest(schemas.createFolder), async (req, res) => {
  try {
    const { name, parentId, description } = req.validatedBody;
    const userId = req.user.id;
    
    const folder = await fileManagerService.createFolder(userId, {
      name,
      parentId,
      description
    });
    
    res.json({ success: true, data: folder });
  } catch (error) {
    logger.error('創建文件夾錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FOLDER_CREATE_ERROR', message: error.message || '創建文件夾失敗' } 
    });
  }
});

// 獲取文件夾結構
router.get('/folder/structure', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const structure = await fileManagerService.getFolderStructure(userId);
    
    res.json({ success: true, data: structure });
  } catch (error) {
    logger.error('獲取文件夾結構錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FOLDER_STRUCTURE_ERROR', message: error.message || '獲取文件夾結構失敗' } 
    });
  }
});

// 移動文件
router.put('/:fileId/move', validateParams(paramSchemas.fileIdParam), validateRequest(schemas.moveFile), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const { targetFolderId } = req.validatedBody;
    const userId = req.user.id;
    
    const result = await fileManagerService.moveFile(fileId, targetFolderId, userId);
    
    res.json({ success: true, data: result });
  } catch (error) {
    logger.error('移動文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_MOVE_ERROR', message: error.message || '移動文件失敗' } 
    });
  }
});

// 複製文件
router.post('/:fileId/copy', validateParams(paramSchemas.fileIdParam), validateRequest(schemas.copyFile), async (req, res) => {
  try {
    const { fileId } = req.validatedParams;
    const { targetFolderId, newName } = req.validatedBody;
    const userId = req.user.id;
    
    const copiedFile = await fileManagerService.copyFile(fileId, targetFolderId, newName, userId);
    
    res.json({ success: true, data: copiedFile });
  } catch (error) {
    logger.error('複製文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_COPY_ERROR', message: error.message || '複製文件失敗' } 
    });
  }
});

// 搜索文件
router.get('/search', validateQuery(querySchemas.fileSearchQuery), async (req, res) => {
  try {
    const { query, type, category, dateRange, sizeRange } = req.validatedQuery;
    const userId = req.user.id;
    
    const searchResults = await fileManagerService.searchFiles(userId, {
      query,
      type,
      category,
      dateRange,
      sizeRange
    });
    
    res.json({ success: true, data: searchResults });
  } catch (error) {
    logger.error('搜索文件錯誤:', error);
    res.status(500).json({ 
      success: false, 
      error: { code: 'FILE_SEARCH_ERROR', message: error.message || '搜索文件失敗' } 
    });
  }
});

module.exports = router;
