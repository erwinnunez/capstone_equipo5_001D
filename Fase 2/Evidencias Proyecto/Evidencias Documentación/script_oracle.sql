-- Crear usuario / esquema (ajusta contraseña según política)
BEGIN
   EXECUTE IMMEDIATE 'CREATE USER SALUD IDENTIFIED BY "salud123"';
EXCEPTION
   WHEN OTHERS THEN
      NULL; -- si ya existe, ignorar
END;
/
BEGIN
   EXECUTE IMMEDIATE 'GRANT CONNECT, RESOURCE TO SALUD';
EXCEPTION
   WHEN OTHERS THEN
      NULL;
END;
/
ALTER SESSION SET CURRENT_SCHEMA = SALUD;
/

-- =================================================================================
-- Tipos ENUM de Postgres reemplazados por CHECKs en columnas que los usan.
-- =================================================================================

-- =================================================================================
-- region
-- =================================================================================
CREATE TABLE region (
    id_region NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre_region VARCHAR2(255) NOT NULL UNIQUE
);

CREATE INDEX ix_region_id_region ON region (id_region);

-- =================================================================================
-- cuidador
-- =================================================================================
CREATE TABLE cuidador (
    rut_cuidador VARCHAR2(50) NOT NULL PRIMARY KEY,
    primer_nombre_cuidador VARCHAR2(255) NOT NULL,
    segundo_nombre_cuidador VARCHAR2(255) NOT NULL,
    primer_apellido_cuidador VARCHAR2(255) NOT NULL,
    segundo_apellido_cuidador VARCHAR2(255) NOT NULL,
    sexo NUMBER(1) NOT NULL, -- 0 = false, 1 = true
    direccion VARCHAR2(255) NOT NULL,
    telefono VARCHAR2(50) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    contrasena VARCHAR2(255) NOT NULL,
    estado NUMBER(1) NOT NULL
);

CREATE INDEX ix_cuidador_rut_cuidador ON cuidador (rut_cuidador);

-- =================================================================================
-- insignia
-- =================================================================================
CREATE TABLE insignia (
    id_insignia NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo NUMBER NOT NULL,
    nombre_insignia VARCHAR2(255) NOT NULL,
    descipcion VARCHAR2(255) NOT NULL
);

CREATE INDEX ix_insignia_id_insignia ON insignia (id_insignia);

-- =================================================================================
-- unidad_medida
-- =================================================================================
CREATE TABLE unidad_medida (
    id_unidad NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo VARCHAR2(100) NOT NULL,
    descipcion VARCHAR2(255) NOT NULL
);

CREATE INDEX ix_unidad_medida_id_unidad ON unidad_medida (id_unidad);

-- =================================================================================
-- comuna
-- =================================================================================
CREATE TABLE comuna (
    id_comuna NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_region NUMBER NOT NULL,
    nombre_comuna VARCHAR2(255) NOT NULL UNIQUE,
    CONSTRAINT fk_comuna_region FOREIGN KEY (id_region) REFERENCES region (id_region)
);

CREATE INDEX ix_comuna_id_comuna ON comuna (id_comuna);
CREATE INDEX ix_comuna_id_region ON comuna (id_region);

-- =================================================================================
-- cuidador_historial
-- =================================================================================
CREATE TABLE cuidador_historial (
    historial_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_cuidador VARCHAR2(50) NOT NULL,
    fecha_cambio TIMESTAMP WITH TIME ZONE NOT NULL,
    cambio VARCHAR2(4000) NOT NULL,
    resultado NUMBER(1) NOT NULL,
    CONSTRAINT fk_cuidador_hist_rut FOREIGN KEY (rut_cuidador) REFERENCES cuidador (rut_cuidador) ON DELETE CASCADE
);

CREATE INDEX ix_cuidador_historial_historial_id ON cuidador_historial (historial_id);
CREATE INDEX ix_cuidador_historial_rut_cuidador ON cuidador_historial (rut_cuidador);

-- =================================================================================
-- parametro_clinico
-- =================================================================================
CREATE TABLE parametro_clinico (
    id_parametro NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_unidad NUMBER NOT NULL,
    codigo VARCHAR2(100) NOT NULL,
    descipcion VARCHAR2(4000) NOT NULL,
    rango_ref_min NUMBER NOT NULL,
    rango_ref_max NUMBER NOT NULL,
    CONSTRAINT fk_parametro_unidad FOREIGN KEY (id_unidad) REFERENCES unidad_medida (id_unidad)
);

CREATE INDEX ix_parametro_clinico_id_parametro ON parametro_clinico (id_parametro);
CREATE INDEX ix_parametro_clinico_id_unidad ON parametro_clinico (id_unidad);

-- =================================================================================
-- medicina
-- =================================================================================
CREATE TABLE medicina (
    id_medicina NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_unidad NUMBER NOT NULL,
    nombre VARCHAR2(255) NOT NULL,
    instrucciones VARCHAR2(4000) NOT NULL,
    toma_maxima VARCHAR2(255) NOT NULL,
    efectos VARCHAR2(4000) NOT NULL,
    CONSTRAINT fk_medicina_unidad FOREIGN KEY (id_unidad) REFERENCES unidad_medida (id_unidad)
);

CREATE INDEX ix_medicina_id_medicina ON medicina (id_medicina);
CREATE INDEX ix_medicina_id_unidad ON medicina (id_unidad);

-- =================================================================================
-- cesfam
-- =================================================================================
CREATE TABLE cesfam (
    id_cesfam NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_comuna NUMBER NOT NULL,
    nombre_cesfam VARCHAR2(255) NOT NULL,
    telefono VARCHAR2(50) NOT NULL,
    direccion VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    estado NUMBER(1) NOT NULL,
    CONSTRAINT fk_cesfam_comuna FOREIGN KEY (id_comuna) REFERENCES comuna (id_comuna)
);

CREATE INDEX ix_cesfam_id_comuna ON cesfam (id_comuna);
CREATE INDEX ix_cesfam_id_cesfam ON cesfam (id_cesfam);

-- =================================================================================
-- paciente
-- =================================================================================
CREATE TABLE paciente (
    rut_paciente VARCHAR2(50) NOT NULL PRIMARY KEY,
    id_comuna NUMBER NOT NULL,
    primer_nombre_paciente VARCHAR2(255) NOT NULL,
    segundo_nombre_paciente VARCHAR2(255) NOT NULL,
    primer_apellido_paciente VARCHAR2(255) NOT NULL,
    segundo_apellido_paciente VARCHAR2(255) NOT NULL,
    fecha_nacimiento TIMESTAMP WITH TIME ZONE NOT NULL,
    sexo NUMBER(1) NOT NULL,
    tipo_de_sangre VARCHAR2(50) NOT NULL,
    enfermedades VARCHAR2(4000) NOT NULL,
    seguro VARCHAR2(255) NOT NULL,
    direccion VARCHAR2(255) NOT NULL,
    telefono VARCHAR2(50) NOT NULL,
    email VARCHAR2(255) NOT NULL UNIQUE,
    contrasena VARCHAR2(255) NOT NULL,
    tipo_paciente VARCHAR2(255) NOT NULL,
    nombre_contacto VARCHAR2(255) NOT NULL,
    telefono_contacto VARCHAR2(50) NOT NULL,
    estado NUMBER(1) NOT NULL,
    id_cesfam NUMBER NOT NULL,
    fecha_inicio_cesfam TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin_cesfam TIMESTAMP WITH TIME ZONE,
    activo_cesfam NUMBER(1) NOT NULL,
    CONSTRAINT fk_paciente_comuna FOREIGN KEY (id_comuna) REFERENCES comuna (id_comuna),
    CONSTRAINT fk_paciente_cesfam FOREIGN KEY (id_cesfam) REFERENCES cesfam (id_cesfam)
);

CREATE INDEX ix_paciente_id_comuna ON paciente (id_comuna);
CREATE INDEX ix_paciente_rut_paciente ON paciente (rut_paciente);
CREATE INDEX ix_paciente_id_cesfam ON paciente (id_cesfam);

-- =================================================================================
-- equipo_medico
-- =================================================================================
CREATE TABLE equipo_medico (
    rut_medico VARCHAR2(50) NOT NULL PRIMARY KEY,
    id_cesfam NUMBER NOT NULL,
    primer_nombre_medico VARCHAR2(255) NOT NULL,
    segundo_nombre_medico VARCHAR2(255) NOT NULL,
    primer_apellido_medico VARCHAR2(255) NOT NULL,
    segundo_apellido_medico VARCHAR2(255) NOT NULL,
    email VARCHAR2(255) NOT NULL,
    contrasenia VARCHAR2(255) NOT NULL,
    telefono VARCHAR2(50) NOT NULL,
    direccion VARCHAR2(255) NOT NULL,
    rol VARCHAR2(255) NOT NULL,
    especialidad VARCHAR2(255) NOT NULL,
    estado NUMBER(1) NOT NULL,
    is_admin NUMBER(1) NOT NULL,
    CONSTRAINT fk_medico_cesfam FOREIGN KEY (id_cesfam) REFERENCES cesfam (id_comuna) -- <-- CORRECCIÓN: should reference cesfam(id_cesfam)
);

-- Fix foreign key above: referencing id_cesfam column in cesfam
ALTER TABLE equipo_medico DROP CONSTRAINT fk_medico_cesfam;
ALTER TABLE equipo_medico ADD CONSTRAINT fk_medico_cesfam FOREIGN KEY (id_cesfam) REFERENCES cesfam (id_cesfam);

CREATE INDEX ix_equipo_medico_id_cesfam ON equipo_medico (id_cesfam);
CREATE INDEX ix_equipo_medico_rut_medico ON equipo_medico (rut_medico);

CREATE INDEX idx_equipo_medico_is_admin_true ON equipo_medico (rut_medico) 
    WHERE is_admin = 1;

-- =================================================================================
-- paciente_cuidador
-- =================================================================================
CREATE TABLE paciente_cuidador (
    rut_paciente VARCHAR2(50) NOT NULL,
    rut_cuidador VARCHAR2(50) NOT NULL,
    permiso_registro NUMBER(1) NOT NULL,
    permiso_lectura NUMBER(1) NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    activo NUMBER(1) NOT NULL,
    CONSTRAINT pk_paciente_cuidador PRIMARY KEY (rut_paciente, rut_cuidador),
    CONSTRAINT fk_pc_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE,
    CONSTRAINT fk_pc_cuidador FOREIGN KEY (rut_cuidador) REFERENCES cuidador (rut_cuidador) ON DELETE CASCADE
);

CREATE INDEX ix_paciente_cuidador_rut_cuidador ON paciente_cuidador (rut_cuidador);
CREATE INDEX ix_paciente_cuidador_rut_paciente ON paciente_cuidador (rut_paciente);

-- =================================================================================
-- paciente_historial
-- =================================================================================
CREATE TABLE paciente_historial (
    historial_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_paciente VARCHAR2(50) NOT NULL,
    fecha_cambio TIMESTAMP WITH TIME ZONE NOT NULL,
    cambio VARCHAR2(4000) NOT NULL,
    resultado NUMBER(1) NOT NULL,
    CONSTRAINT fk_paciente_hist_rut FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE
);

CREATE INDEX ix_paciente_historial_rut_paciente ON paciente_historial (rut_paciente);
CREATE INDEX ix_paciente_historial_historial_id ON paciente_historial (historial_id);

-- =================================================================================
-- medico_historial
-- =================================================================================
CREATE TABLE medico_historial (
    historial_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_medico VARCHAR2(50) NOT NULL,
    fecha_cambio TIMESTAMP WITH TIME ZONE NOT NULL,
    cambio VARCHAR2(4000) NOT NULL,
    resultado NUMBER(1) NOT NULL,
    CONSTRAINT fk_medico_hist_rut FOREIGN KEY (rut_medico) REFERENCES equipo_medico (rut_medico) ON DELETE CASCADE
);

CREATE INDEX ix_medico_historial_historial_id ON medico_historial (historial_id);
CREATE INDEX ix_medico_historial_rut_medico ON medico_historial (rut_medico);

-- =================================================================================
-- gamificacion_perfil
-- =================================================================================
CREATE TABLE gamificacion_perfil (
    rut_paciente VARCHAR2(50) NOT NULL PRIMARY KEY,
    puntos NUMBER NOT NULL,
    racha_dias NUMBER NOT NULL,
    ultima_actividad TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_gam_perfil_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE
);

CREATE INDEX ix_gamificacion_perfil_rut_paciente ON gamificacion_perfil (rut_paciente);

-- =================================================================================
-- evento_gamificacion
-- =================================================================================
CREATE TABLE evento_gamificacion (
    id_evento NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_paciente VARCHAR2(50) NOT NULL,
    tipo VARCHAR2(255) NOT NULL,
    puntos NUMBER NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_evento_gam_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE
);

CREATE INDEX ix_evento_gamificacion_rut_paciente ON evento_gamificacion (rut_paciente);
CREATE INDEX ix_evento_gamificacion_id_evento ON evento_gamificacion (id_evento);

-- =================================================================================
-- usuario_insignia
-- =================================================================================
CREATE TABLE usuario_insignia (
    rut_paciente VARCHAR2(50) NOT NULL,
    id_insignia NUMBER NOT NULL,
    otorgada_en TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT pk_usuario_insignia PRIMARY KEY (rut_paciente, id_insignia),
    CONSTRAINT fk_usuario_insig_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_insig_insignia FOREIGN KEY (id_insignia) REFERENCES insignia (id_insignia)
);

CREATE INDEX ix_usuario_insignia_id_insignia ON usuario_insignia (id_insignia);
CREATE INDEX ix_usuario_insignia_rut_paciente ON usuario_insignia (rut_paciente);

-- =================================================================================
-- rango_paciente
-- =================================================================================
CREATE TABLE rango_paciente (
    id_rango NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_paciente VARCHAR2(50) NOT NULL,
    id_parametro NUMBER NOT NULL,
    min_normal NUMBER NOT NULL,
    max_normal NUMBER NOT NULL,
    min_critico NUMBER NOT NULL,
    max_critico NUMBER NOT NULL,
    vigencia_desde TIMESTAMP WITH TIME ZONE NOT NULL,
    vigencia_hasta TIMESTAMP WITH TIME ZONE NOT NULL,
    version NUMBER NOT NULL,
    definido_por NUMBER(1) NOT NULL,
    CONSTRAINT fk_rango_paciente_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE,
    CONSTRAINT fk_rango_paciente_param FOREIGN KEY (id_parametro) REFERENCES parametro_clinico (id_parametro)
);

CREATE INDEX ix_rango_paciente_id_rango ON rango_paciente (id_rango);
CREATE INDEX ix_rango_paciente_id_parametro ON rango_paciente (id_parametro);
CREATE INDEX ix_rango_paciente_rut_paciente ON rango_paciente (rut_paciente);

-- =================================================================================
-- solicitud_reporte
-- =================================================================================
CREATE TABLE solicitud_reporte (
    id_reporte NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_medico VARCHAR2(50) NOT NULL,
    rango_desde TIMESTAMP WITH TIME ZONE NOT NULL,
    rango_hasta TIMESTAMP WITH TIME ZONE NOT NULL,
    tipo VARCHAR2(255) NOT NULL,
    formato VARCHAR2(100) NOT NULL,
    estado VARCHAR2(100) NOT NULL,
    creado_en TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_solicitud_reporte_medico FOREIGN KEY (rut_medico) REFERENCES equipo_medico (rut_medico)
);

CREATE INDEX ix_solicitud_reporte_id_reporte ON solicitud_reporte (id_reporte);
CREATE INDEX ix_solicitud_reporte_rut_medico ON solicitud_reporte (rut_medico);

-- =================================================================================
-- nota_clinica
-- =================================================================================
CREATE TABLE nota_clinica (
    id_nota NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_paciente VARCHAR2(50) NOT NULL,
    rut_medico VARCHAR2(50) NOT NULL,
    tipo_autor VARCHAR2(100) NOT NULL,
    nota VARCHAR2(4000) NOT NULL,
    tipo_nota VARCHAR2(100) NOT NULL,
    creada_en TIMESTAMP WITH TIME ZONE NOT NULL,
    id_cesfam NUMBER,
    CONSTRAINT fk_nota_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE,
    CONSTRAINT fk_nota_medico FOREIGN KEY (rut_medico) REFERENCES equipo_medico (rut_medico),
    CONSTRAINT fk_nota_cesfam FOREIGN KEY (id_cesfam) REFERENCES cesfam (id_cesfam)
);

CREATE INDEX ix_nota_clinica_rut_paciente ON nota_clinica (rut_paciente);
CREATE INDEX ix_nota_clinica_rut_medico ON nota_clinica (rut_medico);
CREATE INDEX ix_nota_clinica_id_nota ON nota_clinica (id_nota);

-- =================================================================================
-- medicina_detalle
-- =================================================================================
CREATE TABLE medicina_detalle (
    id_detalle NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_medicina NUMBER NOT NULL,
    rut_paciente VARCHAR2(50) NOT NULL,
    dosis VARCHAR2(255) NOT NULL,
    instrucciones_toma VARCHAR2(4000) NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    tomada NUMBER(1) NOT NULL,
    fecha_tomada TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_med_det_medicina FOREIGN KEY (id_medicina) REFERENCES medicina (id_medicina) ON DELETE CASCADE,
    CONSTRAINT fk_med_det_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente) ON DELETE CASCADE
);

CREATE INDEX ix_medicina_detalle_id_detalle ON medicina_detalle (id_detalle);
CREATE INDEX ix_medicina_detalle_rut_paciente ON medicina_detalle (rut_paciente);
CREATE INDEX ix_medicina_detalle_id_medicina ON medicina_detalle (id_medicina);

-- =================================================================================
-- descarga_reporte
-- =================================================================================
CREATE TABLE descarga_reporte (
    id_descarga NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_medico VARCHAR2(50) NOT NULL,
    id_reporte NUMBER NOT NULL,
    descargado_en TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_descarga_reporte_medico FOREIGN KEY (rut_medico) REFERENCES equipo_medico (rut_medico),
    CONSTRAINT fk_descarga_reporte_reporte FOREIGN KEY (id_reporte) REFERENCES solicitud_reporte (id_reporte) ON DELETE CASCADE
);

CREATE INDEX ix_descarga_reporte_rut_medico ON descarga_reporte (rut_medico);
CREATE INDEX ix_descarga_reporte_id_descarga ON descarga_reporte (id_descarga);
CREATE INDEX ix_descarga_reporte_id_reporte ON descarga_reporte (id_reporte);

-- =================================================================================
-- medicion
-- =================================================================================
CREATE TABLE medicion (
    id_medicion NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut_paciente VARCHAR2(50) NOT NULL,
    id_reporte NUMBER,
    fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL,
    origen VARCHAR2(255) NOT NULL,
    registrado_por VARCHAR2(255) NOT NULL,
    observacion VARCHAR2(4000) NOT NULL,
    evaluada_en TIMESTAMP WITH TIME ZONE NOT NULL,
    tiene_alerta NUMBER(1) NOT NULL,
    severidad_max VARCHAR2(50) NOT NULL,
    resumen_alerta VARCHAR2(4000) NOT NULL,
    estado_alerta VARCHAR2(50) DEFAULT 'nueva' NOT NULL,
    tomada_por VARCHAR2(50),
    tomada_en TIMESTAMP WITH TIME ZONE,
    resuelta_en TIMESTAMP WITH TIME ZONE,
    ignorada_en TIMESTAMP WITH TIME ZONE,
    CONSTRAINT chk_medicion_estado_alerta CHECK (estado_alerta IN ('nueva','en_proceso','resuelta','ignorada')),
    CONSTRAINT fk_medicion_paciente FOREIGN KEY (rut_paciente) REFERENCES paciente (rut_paciente),
    CONSTRAINT fk_medicion_reporte FOREIGN KEY (id_reporte) REFERENCES solicitud_reporte (id_reporte),
    CONSTRAINT fk_medicion_tomada_por FOREIGN KEY (tomada_por) REFERENCES equipo_medico (rut_medico)
);

CREATE INDEX ix_medicion_id_medicion ON medicion (id_medicion);
CREATE INDEX ix_medicion_tomada_por ON medicion (tomada_por);
CREATE INDEX ix_medicion_id_reporte ON medicion (id_reporte);
CREATE INDEX ix_medicion_tomada_por_estado ON medicion (tomada_por, estado_alerta);
CREATE INDEX ix_medicion_rut_paciente ON medicion (rut_paciente);
CREATE INDEX ix_medicion_alerta_estado_fecha ON medicion (tiene_alerta, estado_alerta, fecha_registro DESC);

-- =================================================================================
-- medicion_detalle
-- =================================================================================
CREATE TABLE medicion_detalle (
    id_detalle NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_medicion NUMBER NOT NULL,
    id_parametro NUMBER NOT NULL,
    id_unidad NUMBER NOT NULL,
    valor_num NUMBER NOT NULL,
    valor_texto VARCHAR2(4000) NOT NULL,
    fuera_rango NUMBER(1) NOT NULL,
    severidad VARCHAR2(50) NOT NULL,
    umbral_min NUMBER NOT NULL,
    umbral_max NUMBER NOT NULL,
    tipo_alerta VARCHAR2(100) NOT NULL,
    CONSTRAINT fk_medicion_det_medicion FOREIGN KEY (id_medicion) REFERENCES medicion (id_medicion) ON DELETE CASCADE,
    CONSTRAINT fk_medicion_det_param FOREIGN KEY (id_parametro) REFERENCES parametro_clinico (id_parametro),
    CONSTRAINT fk_medicion_det_unidad FOREIGN KEY (id_unidad) REFERENCES unidad_medida (id_unidad)
);

CREATE INDEX ix_medicion_detalle_id_parametro ON medicion_detalle (id_parametro);
CREATE INDEX ix_medicion_detalle_id_medicion ON medicion_detalle (id_medicion);
CREATE INDEX ix_medicion_detalle_id_unidad ON medicion_detalle (id_unidad);
CREATE INDEX ix_medicion_detalle_id_detalle ON medicion_detalle (id_detalle);
