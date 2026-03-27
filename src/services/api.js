import { supabase } from './supabase';

// --- Teachers ---

export const getTeachers = async () => {
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createTeacher = async (name, phone) => {
  const { data, error } = await supabase
    .from('teachers')
    .insert([{ name, phone }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTeacher = async (id, updates) => {
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTeacher = async (id) => {
  const { error } = await supabase
    .from('teachers')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- Students ---

export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      teachers (
        name
      )
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const createStudent = async (name, teacher_id, monthly_fee) => {
  const { data, error } = await supabase
    .from('students')
    .insert([{ name, teacher_id, monthly_fee }])
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateStudent = async (id, updates) => {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteStudent = async (id) => {
  // Related fees will be deleted automatically due to ON DELETE CASCADE
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
};

// --- Fees ---

/**
 * Creates unpaid fee records for all students for a specific month.
 * Avoids duplicates due to UNIQUE constraint in DB, catching those errors gracefully.
 */
export const createMonthlyFeesForAllStudents = async (month) => {
  // Fetch all students to get their IDs
  const { data: students, error: studentError } = await supabase
    .from('students')
    .select('id, monthly_fee');
  
  if (studentError) throw studentError;
  if (!students || students.length === 0) return 0;

  // Insert fee records one by one or in a batch
  // Inserting in a batch: if one fails (duplicate), the whole batch might fail if not careful.
  // Given we want to avoid duplicates without breaking, we can try batch and handle duplicates
  // OR do an upsert OR insert one by one. With Supabase, upsert with constraint allows ignoring duplicates
  const feeRecords = students.map(student => ({
    student_id: student.id,
    month,
    status: 'unpaid',
    amount_paid: 0
  }));

  const { data, error } = await supabase
    .from('fees')
    .upsert(feeRecords, { onConflict: 'student_id, month', ignoreDuplicates: true })
    .select();

  if (error) throw error;
  
  return data ? data.length : 0;
};

export const getFeesByMonth = async (month) => {
  const { data, error } = await supabase
    .from('fees')
    .select(`
      id,
      month,
      status,
      amount_paid,
      payment_date,
      students!inner (
        id,
        name,
        monthly_fee,
        teachers (
          name
        )
      )
    `)
    .eq('month', month)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const markFeeAsPaid = async (fee_id, amount_paid) => {
  const { data, error } = await supabase
    .from('fees')
    .update({
      status: 'paid',
      amount_paid: amount_paid,
      payment_date: new Date().toISOString()
    })
    .eq('id', fee_id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getUnpaidFees = async (month) => {
  const { data, error } = await supabase
    .from('fees')
    .select(`
      *,
      students (
        name,
        monthly_fee
      )
    `)
    .eq('month', month)
    .eq('status', 'unpaid');
    
  if (error) throw error;
  return data;
};
