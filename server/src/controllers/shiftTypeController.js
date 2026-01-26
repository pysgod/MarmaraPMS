const { ShiftType, Project } = require('../models')

// Get all shift types for a project
exports.getProjectShiftTypes = async (req, res) => {
  try {
    const { projectId } = req.params
    const shiftTypes = await ShiftType.findAll({
      where: { project_id: projectId },
      order: [['order', 'ASC'], ['id', 'ASC']]
    })
    res.json(shiftTypes)
  } catch (error) {
    console.error('Error fetching shift types:', error)
    res.status(500).json({ message: 'Vardiya tipleri getirilemedi' })
  }
}

// Create new shift type
exports.createShiftType = async (req, res) => {
  try {
    const { project_id, name, short_code, color, hours, start_time, end_time } = req.body
    
    // Get max order to append
    const maxOrder = await ShiftType.max('order', { where: { project_id } }) || 0
    
    const newOrder = maxOrder + 1
    
    const shiftType = await ShiftType.create({
      project_id,
      name,
      short_code: String(newOrder), // Force sequential short_code
      color,
      hours: hours || 8,
      start_time,
      end_time,
      order: newOrder
    })
    
    res.status(201).json(shiftType)
  } catch (error) {
    console.error('Error creating shift type:', error)
    res.status(500).json({ message: 'Vardiya tipi oluşturulamadı' })
  }
}

// Update shift type
exports.updateShiftType = async (req, res) => {
  try {
    const { id } = req.params
    const { name, short_code, color, hours, start_time, end_time } = req.body
    
    const shiftType = await ShiftType.findByPk(id)
    if (!shiftType) {
      return res.status(404).json({ message: 'Vardiya tipi bulunamadı' })
    }
    
    await shiftType.update({
      name,
      short_code,
      color,
      hours,
      start_time,
      end_time
    })
    
    res.json(shiftType)
  } catch (error) {
    console.error('Error updating shift type:', error)
    res.status(500).json({ message: 'Vardiya tipi güncellenemedi' })
  }
}

// Delete shift type
exports.deleteShiftType = async (req, res) => {
  try {
    const { id } = req.params
    const shiftType = await ShiftType.findByPk(id)
    if (!shiftType) {
      return res.status(404).json({ message: 'Vardiya tipi bulunamadı' })
    }
    
    // Check if used? Maybe just let it fail DB constraint or handle gracefully
    // For now, allow delete, but it might break existing WorkSchedules if not cascaded or set null
    // We should probably check usage but for MVP user wants flexibility. 
    // Usually ON DELETE SET NULL is safer if DB configured, or restricted.
    
    await shiftType.destroy()
    res.json({ message: 'Vardiya tipi silindi' })
  } catch (error) {
    console.error('Error deleting shift type:', error)
    res.status(500).json({ message: 'Vardiya tipi silinemedi' })
  }
}

// Reorder shift types
exports.reorderShiftTypes = async (req, res) => {
  try {
    const { orderUpdates } = req.body // Array of { id, order }
    
    if (!Array.isArray(orderUpdates)) {
      return res.status(400).json({ message: 'Geçersiz veri formatı' })
    }
    
    await Promise.all(orderUpdates.map(({ id, order }) => 
      ShiftType.update({ 
        order,
        short_code: String(order + 1)
      }, { where: { id } })
    ))
    
    res.json({ message: 'Sıralama güncellendi' })
  } catch (error) {
    console.error('Error reordering shift types:', error)
    res.status(500).json({ message: 'Sıralama güncellenemedi' })
  }
}
