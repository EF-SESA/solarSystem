-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 09-08-2023 a las 17:39:54
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nss`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `bateria`
--

CREATE TABLE `bateria` (
  `id` int(11) NOT NULL,
  `modelo` varchar(80) NOT NULL,
  `tension` float NOT NULL,
  `cap` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `bateria`
--

INSERT INTO `bateria` (`id`, `modelo`, `tension`, `cap`) VALUES
(1, 'EFB-3U0-48100-CS', 48, 4800),
(2, 'EFB-4.5U0-48150-CS', 48, 7200),
(3, 'SOLUNA 10K PACK HV', 268.8, 10000),
(4, 'SOLUNA 15K PACK HV', 384, 15000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inversor`
--

CREATE TABLE `inversor` (
  `id` int(11) NOT NULL,
  `modelo` varchar(80) NOT NULL,
  `potencia` float NOT NULL,
  `maxpv` float NOT NULL,
  `cantmppt` int(11) NOT NULL,
  `inputmppt` int(11) NOT NULL,
  `vmin` float NOT NULL,
  `vmax` float NOT NULL,
  `imppt` float NOT NULL,
  `ioutput` float NOT NULL,
  `ibat` float NOT NULL,
  `eff` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `inversor`
--

INSERT INTO `inversor` (`id`, `modelo`, `potencia`, `maxpv`, `cantmppt`, `inputmppt`, `vmin`, `vmax`, `imppt`, `ioutput`, `ibat`, `eff`) VALUES
(1, 'GW3600M-ES-20', 3600, 4500, 2, 1, 60, 550, 23, 16.7, 75, 98.7),
(2, 'GW5K-ET\r\n', 5000, 6250, 2, 1, 180, 600, 15.2, 8.5, 25, 98),
(3, 'GW10K-ET', 10000, 12500, 2, 1, 180, 600, 15.2, 16.5, 25, 98.2),
(4, 'GW25K-MT', 25000, 37500, 3, 2, 200, 950, 31.3, 21.7, 0, 98.8),
(5, 'GW36K-MT', 36000, 54000, 3, 2, 200, 950, 31.3, 53.3, 0, 98.8),
(6, 'SOLIS-3P5K-4G', 5000, 6250, 2, 2, 160, 500, 17.2, 14.4, 0, 98);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nahuel`
--

CREATE TABLE `nahuel` (
  `id` int(11) NOT NULL,
  `mes` varchar(10) DEFAULT NULL,
  `Irr` varchar(20) DEFAULT NULL,
  `Hsun` varchar(20) DEFAULT NULL,
  `T2m` varchar(20) DEFAULT NULL,
  `WS10m` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nahuel`
--

INSERT INTO `nahuel` (`id`, `mes`, `Irr`, `Hsun`, `T2m`, `WS10m`) VALUES
(1, '01', '0', '0', '24.13', '4.41'),
(2, '01', '0', '0', '23.23', '4.62'),
(3, '01', '0', '0', '22.67', '4.28'),
(4, '01', '0', '0', '22.26', '4.07');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `panel`
--

CREATE TABLE `panel` (
  `id` int(11) NOT NULL,
  `modelo` varchar(80) NOT NULL,
  `potencia` float NOT NULL,
  `voc` float NOT NULL,
  `isc` float NOT NULL,
  `coefv` float NOT NULL,
  `coefi` float NOT NULL,
  `eff` float NOT NULL,
  `altura` float NOT NULL,
  `ancho` float NOT NULL,
  `espesor` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `panel`
--

INSERT INTO `panel` (`id`, `modelo`, `potencia`, `voc`, `isc`, `coefv`, `coefi`, `eff`, `altura`, `ancho`, `espesor`) VALUES
(1, 'EGE-450W-120M', 450, 41.17, 13.85, -0.28, 0.048, 20.79, 1909, 1134, 35),
(2, 'EGE-550W-144M', 550, 49.68, 14.01, -0.28, 0.048, 21.28, 2279, 1134, 35);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proyecto`
--

CREATE TABLE `proyecto` (
  `id` int(11) NOT NULL,
  `nombre` varchar(80) NOT NULL,
  `latitud` float NOT NULL,
  `longitud` float NOT NULL,
  `inversor` varchar(50) NOT NULL,
  `panel` varchar(50) NOT NULL,
  `bateria` varchar(50) NOT NULL,
  `genset` varchar(50) NOT NULL,
  `consumo` varchar(500) NOT NULL,
  `panelserie` int(11) NOT NULL,
  `panelparalelo` int(11) NOT NULL,
  `bateriaserie` int(11) NOT NULL,
  `bateriaparalelo` int(11) NOT NULL,
  `sistema` varchar(20) NOT NULL,
  `irr` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`irr`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proyecto`
--

INSERT INTO `proyecto` (`id`, `nombre`, `latitud`, `longitud`, `inversor`, `panel`, `bateria`, `genset`, `consumo`, `panelserie`, `panelparalelo`, `bateriaserie`, `bateriaparalelo`, `sistema`, `irr`) VALUES
(1, 'Mi proyecto', 0, 0, '', '', '', '', '', 0, 0, 0, 0, '', ''),
(8, 'Nahuel', -34.6859, -58.5583, '', '', '', '', '', 0, 0, 0, 0, 'Hibrido', ''),
(10, 'Oscar', -34.6242, -58.8428, '', '', '', '', '', 0, 0, 0, 0, 'On-Grid', '');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `bateria`
--
ALTER TABLE `bateria`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `inversor`
--
ALTER TABLE `inversor`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `nahuel`
--
ALTER TABLE `nahuel`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `panel`
--
ALTER TABLE `panel`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `bateria`
--
ALTER TABLE `bateria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `inversor`
--
ALTER TABLE `inversor`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `nahuel`
--
ALTER TABLE `nahuel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `panel`
--
ALTER TABLE `panel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `proyecto`
--
ALTER TABLE `proyecto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
